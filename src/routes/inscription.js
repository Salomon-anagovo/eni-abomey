const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Inscription = require('../models/Inscription');
const sendConfirmationEmail = require('../utils/sendConfirmationEmail');

// Affichage du formulaire
router.get('/', (req, res) => {
  res.render('public/inscription', {
    title: 'Inscription',
    currentYear: new Date().getFullYear(),
    success: req.query.success
  });
});

// Traitement du formulaire
router.post('/', async (req, res) => {
  const { nom, prenom, email, telephone, pays, role, password } = req.body;

  if (!nom || !prenom || !email || !telephone || !pays || !role || !password) {
    return res.redirect('/inscription?error=Veuillez remplir tous les champs');
  }

  try {
    const existing = await Inscription.findOne({ email });
    if (existing) {
      return res.redirect('/inscription?error=Cet email est déjà inscrit');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(20).toString('hex');

    const newUser = await Inscription.create({
      nom, prenom, email, telephone, pays, role,
      password: hashedPassword,
      confirmationToken: token
    });

    await sendConfirmationEmail(email, token);

    res.redirect('/inscription?success=Inscription réussie ! Veuillez vérifier votre email.');
  } catch (err) {
    console.error(err);
    res.redirect('/inscription?error=Une erreur est survenue.');
  }
});

// Confirmation d'email
router.get('/confirmation/:token', async (req, res) => {
  const user = await Inscription.findOne({ confirmationToken: req.params.token });
  if (!user) {
    return res.send('Lien invalide ou expiré.');
  }

  user.confirmed = true;
  user.confirmationToken = undefined;
  await user.save();

  res.send('Votre inscription a été confirmée avec succès ! Vous pouvez maintenant vous connecter.');
});

module.exports = router;
