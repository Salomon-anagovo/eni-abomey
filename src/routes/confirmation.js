const express = require('express');
const router = express.Router();
const Inscription = require('../models/Inscription');

router.get('/:token', async (req, res) => {
  const token = req.params.token;

  try {
    const utilisateur = await Inscription.findOne({ confirmationToken: token });

    if (!utilisateur) {
      return res.status(404).send('Lien de confirmation invalide ou expiré.');
    }

    // Marquer comme confirmé
    utilisateur.confirmed = true;
    utilisateur.confirmationToken = undefined; // supprimer le token
    await utilisateur.save();

    res.send('✅ Votre inscription a été confirmée avec succès ! Vous pouvez maintenant vous connecter.');
  } catch (err) {
    console.error('Erreur de confirmation :', err);
    res.status(500).send('Erreur du serveur.');
  }
});

module.exports = router;
