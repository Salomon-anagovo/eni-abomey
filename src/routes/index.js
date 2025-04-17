const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');


// Middleware d'authentification
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

// Middleware pour injecter les données de navigation
const injectNavData = (req, res, next) => {
  res.locals.navLinks = [
    { path: '/', title: 'Accueil', icon: '🏠' },
    { path: '/dashboard', title: 'Tableau de bord', icon: '📊', auth: true },
    { path: '/eleves', title: 'Élèves', icon: '👨‍🎓', auth: true },
    { path: '/formateurs', title: 'Formateurs', icon: '👨‍🏫', auth: true, roles: ['admin', 'formateur'] },
    { path: '/admin', title: 'Admin', icon: '🔐', auth: true, roles: ['admin'] }
  ];
  
  res.locals.user = req.user || null;
  next();
};

router.use(injectNavData);

// Page d'accueil
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'ENI Abomey - Gestion pédagogique',
    currentYear: new Date().getFullYear()
  });
});

// Page de connexion
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/dashboard');
  res.render('auth/login', {
    title: 'Connexion',
    csrfToken: req.csrfToken()
  });
});

// Traitement de la connexion
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

// Tableau de bord
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', {
    title: 'Tableau de bord',
    user: req.user
  });
});

// Déconnexion
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Déconnexion réussie');
    res.redirect('/');
  });
});

// Route pour le formulaire d’inscription public
router.use('/inscription', require('./inscription'));

module.exports = router;