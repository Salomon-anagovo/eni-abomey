const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');

const Inscription = require('../models/Inscription');
const sendConfirmationEmail = require('../utils/sendConfirmationEmail');
const cloudinary = require('../config/cloudinary');

// Configuration Multer pour les fichiers temporaires
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'tmp/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  if (extname && mimetype) cb(null, true);
  else cb(new Error('Seuls les fichiers .jpg, .png, .jpeg, .pdf sont autorisés.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'documents', maxCount: 10 }
]);

// --- Affichage du formulaire ---
router.get('/inscription', (req, res) => {
  res.render('public/inscription', {
    title: 'Inscription',
    currentYear: new Date().getFullYear(),
    success: req.query.success,
    error: req.query.error,
    formData: {}
  });
});

// --- Traitement du formulaire ---
router.post('/inscription', upload, async (req, res) => {
  try {
    const {
      nom, prenom, email, telephone, pays, indicatif,
      dateNaissance, lieuNaissance, role, password, conditions
    } = req.body;

    // Vérification des champs requis
    if (!nom || !prenom || !email || !telephone || !pays || !indicatif || !dateNaissance || !lieuNaissance || !password || !conditions) {
      return res.redirect('/inscription?error=Veuillez remplir tous les champs obligatoires.');
    }

    const existing = await Inscription.findOne({ email });
    if (existing) {
      return res.redirect('/inscription?error=Cet email est déjà utilisé.');
    }

    // Upload de la photo vers Cloudinary
    let photo = { url: '', public_id: '' };
    if (req.files && req.files.photo && req.files.photo[0]) {
      const result = await cloudinary.uploader.upload(req.files.photo[0].path, {
        folder: 'eni/photos'
      });
      photo = { url: result.secure_url, public_id: result.public_id };
    }

    // Upload des documents vers Cloudinary
    let documents = [];
    if (req.files && req.files.documents) {
      for (const file of req.files.documents) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'eni/documents',
          resource_type: 'auto'
        });
        documents.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(20).toString('hex');

    // Création du compte
    const newUser = new Inscription({
      nom, prenom, email, telephone, pays, indicatif,
      dateNaissance, lieuNaissance, role,
      password: hashedPassword,
      photo,
      documents,
      conditions: true,
      confirmationToken: token
    });

    await newUser.save();

    // Envoi de l'email de confirmation
    await sendConfirmationEmail(email, token);

    res.redirect('/inscription?success=Inscription réussie ! Veuillez vérifier votre email.');

  } catch (err) {
    console.error(err);
    res.redirect('/inscription?error=Une erreur est survenue pendant l\'inscription.');
  }
});

// --- Confirmation de l'email ---
router.get('/confirmation/:token', async (req, res) => {
  try {
    const user = await Inscription.findOne({ confirmationToken: req.params.token });
    if (!user) {
      return res.send('Lien de confirmation invalide ou expiré.');
    }

    user.confirmed = true;
    user.confirmationToken = undefined;
    await user.save();

    res.send('Votre inscription est confirmée ! Vous pouvez maintenant vous connecter.');
  } catch (err) {
    console.error(err);
    res.send('Erreur lors de la confirmation.');
  }
});

module.exports = router;
