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
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const mongoUri = process.env.MONGODB_URI || "mongodb+srv://eni_user:Barack122021@cluster0.gbiilyl.mongodb.net/EleveInstituteur?retryWrites=true&w=majority";

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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(session({
  secret: process.env.SESSION_SECRET || 'votre_secret_tres_complexe',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoUri }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(csrf());
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/eleves', require('./routes/eleves'));
app.use('/formateurs', require('./routes/formateurs'));
app.use('/admin', require('./routes/admin'));

app.use((req, res, next) => {
  res.status(404).render('error/404', {
    title: 'Page non trouvée',
    layout: 'layouts/base'
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Erreur non capturée:', err);
  server.close(() => process.exit(1));
});

module.exports = app;