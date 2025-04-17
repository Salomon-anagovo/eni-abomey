const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/auth');

// Page d'accueil
router.get('/', forwardAuthenticated, (req, res) => {
  res.render('index', {
    title: 'ENI Abomey - Gestion des élèves',
    currentYear: new Date().getFullYear()
  });
});

// Page de connexion (GET)
router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('login', {
    title: 'Connexion',
    csrfToken: req.csrfToken(),
    messages: req.flash()
  });
});

// Connexion (POST)
router.post('/login', [
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Email ou mot de passe incorrect'
  }),
  (req, res) => {
    // Après connexion réussie
    req.flash('success', `Bienvenue ${req.user.prenom} !`);
    res.redirect(req.session.returnTo || '/dashboard');
    delete req.session.returnTo;
  }
]);

// Page de dashboard (protégée)
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    title: 'Tableau de bord',
    user: req.user,
    lastLogin: req.user.lastLogin?.toLocaleString() || 'Première connexion'
  });
});

// Déconnexion
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success', 'Vous avez été déconnecté avec succès');
    res.redirect('/');
  });
});

// Page de réinitialisation de mot de passe
router.get('/reset-password', (req, res) => {
  res.render('reset-password', {
    title: 'Réinitialisation du mot de passe',
    csrfToken: req.csrfToken()
  });
});

module.exports = router;