// src/routes/index.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');

// Page d'accueil
router.get('/', (req, res) => {
  res.send('Bienvenue sur l’application de gestion ENI Abomey');
});

// Page de connexion (GET)
router.get('/login', (req, res) => {
  res.send('<form method="POST" action="/login">Email: <input name="email" /><br/>Mot de passe: <input name="password" type="password" /><br/><button type="submit">Connexion</button></form>');
});

// Connexion (POST)
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
}));

// Page de dashboard (protégée)
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.send(`Bienvenue ${req.user.prenom} ! Vous êtes connecté en tant que ${req.user.role}`);
});

// Déconnexion
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Middleware pour vérifier l’authentification
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

module.exports = router;
