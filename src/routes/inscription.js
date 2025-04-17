const express = require('express');
const router = express.Router();
const Inscription = require('../models/Inscription');

// Affichage du formulaire d’inscription
router.get('/', (req, res) => {
  res.render('public/inscription', {
    title: 'Inscription',
    currentYear: new Date().getFullYear()
  });
});

// Traitement du formulaire d’inscription
router.post('/', async (req, res) => {
  const { nom, prenom, email, telephone, pays, role } = req.body;

  // Vérification simple des champs requis
  if (!nom || !prenom || !email || !telephone || !pays || !role) {
    req.flash('error', 'Veuillez remplir tous les champs requis.');
    return res.redirect('/inscription');
  }

  try {
    // Vérifier si l'email est déjà utilisé
    const existing = await Inscription.findOne({ email });
    if (existing) {
      req.flash('error', 'Cet email est déjà inscrit.');
      return res.redirect('/inscription');
    }

    await Inscription.create({
      nom,
      prenom,
      email,
      telephone,
      pays,
      role
    });

    req.flash('success', 'Inscription réussie ! Merci pour votre intérêt.');
    res.redirect('/inscription');
  } catch (err) {
    console.error('Erreur lors de l’inscription :', err);
    req.flash('error', 'Une erreur est survenue. Veuillez réessayer.');
    res.redirect('/inscription');
  }
});

module.exports = router;
