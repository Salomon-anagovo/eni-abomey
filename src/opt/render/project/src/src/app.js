require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const chalk = require('chalk');

// Import des middlewares personnalisés
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/db');

// Initialisation de l'application
const app = express();

// =============================================
// 1. CONFIGURATION DE BASE & MIDDLEWARES GÉNÉRAUX
// =============================================

// 🔒 Sécurité HTTP headers (Helmet)
app.use(helmet());

// 🔄 Compression des réponses
app.use(compression());

// 📝 Logger des requêtes (morgan)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Création d'un système de logs rotatifs en production
  const logDirectory = path.join(__dirname, 'logs');
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
  const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: logDirectory
  });
  app.use(morgan('combined', { stream: accessLogStream }));
}

// 🛡️ Protection contre les attaques XSS
app.use(xss());

// ⏱️ Limiteur de requêtes (Rate Limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Limite différente en dev/prod
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api', limiter);

// 📦 Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🧹 Nettoyage des données contre les injections NoSQL
app.use(mongoSanitize());

// 🚫 Protection contre la pollution des paramètres HTTP
app.use(hpp());

// 🍪 Gestion des cookies
app.use(cookieParser());

// 🌍 Configuration CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// =============================================
// 2. CONNEXION À LA BASE DE DONNÉES
// =============================================

// 🗃️ Connexion MongoDB
connectDB().catch(err => {
  console.error(chalk.red('❌ Échec critique de la connexion MongoDB:'), err);
  process.exit(1);
});

// =============================================
// 3. ROUTES DE L'APPLICATION
// =============================================

// 📁 Routes statiques
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 🔐 Routes API
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/eleves', require('./routes/eleves'));
app.use('/api/v1/formateurs', require('./routes/formateurs'));
app.use('/api/v1/personnel', require('./routes/personnel'));
app.use('/api/v1/notes', require('./routes/notes'));
app.use('/api/v1/bibliotheque', require('./routes/bibliotheque'));
app.use('/api/v1/paiements', require('./routes/paiements'));
app.use('/api/v1/archives', require('./routes/archives'));
app.use('/api/v1/stages', require('./routes/stages'));
app.use('/api/v1/emploi-du-temps', require('./routes/emploiDuTemps'));
app.use('/api/v1/admin', require('./routes/admin'));
app.use(errorHandler);

// =============================================
// 4. GESTION DES ERREURS
// =============================================

// ❌ Route non trouvée (404)
app.all('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.originalUrl}`
  });
});

// 🚨 Middleware global de gestion des erreurs
app.use(errorHandler);

// =============================================
// 5. DÉMARRAGE DU SERVEUR
// =============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(chalk.green.bold(`
  ============================================
   🚀 Serveur ENI-Gestion démarré sur le port ${PORT}
   Mode: ${process.env.NODE_ENV || 'development'}
   URL: http://localhost:${PORT}
  ============================================
  `));
});

// =============================================
// 6. GESTION DES ÉVÉNEMENTS PROCESS
// =============================================

// 🛑 Gestion des erreurs non catchées
process.on('unhandledRejection', (err) => {
  console.error(chalk.red('❌ Unhandled Rejection:'), err);
  server.close(() => process.exit(1));
});

// 🛑 Gestion des signaux d'arrêt
process.on('SIGTERM', () => {
  console.log(chalk.yellow('🛑 SIGTERM reçu. Arrêt gracieux du serveur'));
  server.close(() => {
    console.log(chalk.green('✅ Process terminé proprement'));
    process.exit(0);
  });
});

module.exports = app;