require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const flash = require('connect-flash');
const csrf = require('csurf');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialisation de l'application
const app = express();

// Configuration MongoDB sécurisée
const mongoUri = process.env.MONGODB_URI || "mongodb+srv://eni_user:Barack122021@cluster0.gbiilyl.mongodb.net/EleveInstituteur?retryWrites=true&w=majority";

// Connexion à MongoDB avec gestion d'erreur améliorée
mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => {
  console.error('❌ Erreur MongoDB:', err.message);
  process.exit(1);
});

// Middlewares de sécurité
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"]
  }
}));

// Limiteur de requêtes
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard' }
}));

// Configuration des sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'votre_secret_complexe_32caracteres',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoUri }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 86400000 // 1 jour
  }
}));

// Authentification
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Flash messages et CSRF
app.use(flash());
app.use(csrf({ cookie: true }));
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Variables globales
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.flash = req.flash();
  next();
});

// Configuration des vues
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/eleves', require('./routes/eleves'));
app.use('/formateurs', require('./routes/formateurs'));
app.use('/admin', require('./routes/admin'));

// Gestion des erreurs
app.use((req, res) => {
  res.status(404).render('error/404', { title: 'Page non trouvée' });
});
app.use(errorHandler);

// Démarrage du serveur
const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('Erreur non capturée:', err);
  server.close(() => process.exit(1));
});

module.exports = app;