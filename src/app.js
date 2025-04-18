require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const confirmationRoute = require('./routes/confirmation');

// Initialisation
const app = express();

// Configuration du moteur de vue EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connexion MongoDB (avec gestion d'erreur améliorée)
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://eni_user:Barack122021@cluster0.mongodb.net/EleveInstituteur?retryWrites=true&w=majority', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => {
  console.error('❌ Erreur MongoDB:', err.message);
  process.exit(1);
});

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/confirmation', confirmationRoute);

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'm0nAppS3cretK3y',
  store: MongoStore.create({ mongoUrl: mongoose.connection.client.s.url }),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Passport
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use(require('./routes'));

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Erreur serveur');
});

// Démarrage
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = app;
