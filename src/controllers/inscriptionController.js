// controllers/inscriptionController.js
const Inscription = require('../models/Inscription');

exports.afficherFormulaire = (req, res) => {
  res.render('inscription', { title: 'Inscription' });
};

exports.enregistrerInscription = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, pays, role } = req.body;

    const nouvelleInscription = new Inscription({
      nom,
      prenom,
      email,
      telephone,
      pays,
      role
    });

    await nouvelleInscription.save();
    res.redirect('/?success=1');
  } catch (err) {
    console.error('Erreur lors de l\'inscription :', err.message);
    res.status(500).send('Erreur lors de l\'enregistrement');
  }
};
