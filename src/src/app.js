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

// Configuration MongoDB (version sécurisée)
const mongoUri = process.env.MONGODB_URI || "mongodb+srv://eni_user:Barack122021@cluster0.gbiilyl.mongodb.net/EleveInstituteur?retryWrites=true&w=majority";

// Connexion à MongoDB avec gestion améliorée
mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
  w: 'majority'
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => {
  console.error('❌ Erreur MongoDB:', err);
  process.exit(1);
});

// Middleware de sécurité
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
    styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "fonts.googleapis.com"],
    imgSrc: ["'self'", "data:", "cdn.jsdelivr.net"],
    fontSrc: ["'self'", "fonts.gstatic.com", "cdn.jsdelivr.net"],
    connectSrc: ["'self'"]
  }
}));

// Limitation du taux de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Configuration des sessions avec stockage MongoDB
app.use(session({
  secret: process.env.SESSION_SECRET || 'votre_secret_tres_complexe',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoUri }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 jour
  }
}));

// Initialisation de Passport (authentification)
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Messages flash
app.use(flash());

// Protection CSRF
app.use(csrf());
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Middleware pour variables globales
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;
  next();
});

// Configuration des vues
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pour fichiers statiques - CORRECTION ICI
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0'
})); // Parenthèse manquante ajoutée

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes principales
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/eleves', require('./routes/eleves'));
app.use('/formateurs', require('./routes/formateurs'));
app.use('/admin', require('./routes/admin'));

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).render('error/404', {
    title: 'Page non trouvée',
    layout: 'layouts/base'
  });
});

// Gestionnaire d'erreurs global
app.use(errorHandler);

// Démarrage du serveur
const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('Erreur non capturée:', err);
  server.close(() => process.exit(1));
});

module.exports = app;