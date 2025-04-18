const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { validationResult } = require('express-validator');

// Config pour Multer (upload des fichiers)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Route pour l'inscription
app.post('/inscription', upload.fields([{ name: 'photo' }, { name: 'documents' }]), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('inscription', {
      error: "Veuillez remplir tous les champs correctement."
    });
  }

  // Vérification si les conditions sont acceptées
  if (!req.body.conditions) {
    return res.render('inscription', {
      error: "Vous devez accepter les conditions d'utilisation."
    });
  }

  // Hash du mot de passe
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const newUser = new User({
    nom: req.body.nom,
    prenom: req.body.prenom,
    email: req.body.email,
    telephone: req.body.telephone,
    dateNaissance: req.body.dateNaissance,
    lieuNaissance: req.body.lieuNaissance,
    role: req.body.role,
    pays: req.body.pays,
    indicatif: req.body.indicatif,
    photo: req.files.photo[0].path,
    documents: req.files.documents ? req.files.documents.map(file => file.path) : [],
    password: hashedPassword
  });

  await newUser.save();
  res.redirect('/connexion');
});
