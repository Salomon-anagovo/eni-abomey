const Inscription = require('../models/Inscription');

// Affiche la page d'inscription
exports.getForm = (req, res) => {
  res.render('public/inscription', {
    title: 'Inscription',
    currentYear: new Date().getFullYear(),
    success: req.flash('success'),
    error: req.flash('error')
  });
};

// Traite les données du formulaire
exports.submitForm = async (req, res) => {
  const { nom, prenom, email, telephone, pays, role } = req.body;

  // Validation basique
  if (!nom || !prenom || !email || !telephone || !pays || !role) {
    req.flash('error', 'Tous les champs sont obligatoires.');
    return res.redirect('/inscription');
  }

  try {
    // Vérifie si l'utilisateur existe déjà
    const exists = await Inscription.findOne({ email });
    if (exists) {
      req.flash('error', 'Cet email est déjà utilisé.');
      return res.redirect('/inscription');
    }

    // Crée un nouvel enregistrement
    await Inscription.create({
      nom,
      prenom,
      email,
      telephone,
      pays,
      role
    });

    req.flash('success', 'Inscription réussie !');
    res.redirect('/inscription');
  } catch (err) {
    console.error('Erreur lors de l’inscription :', err);
    req.flash('error', 'Une erreur est survenue, veuillez réessayer.');
    res.redirect('/inscription');
  }
};
