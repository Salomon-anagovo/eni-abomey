const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const inscriptionController = require('../controllers/inscriptionController');

// --- Configuration Multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'tmp/'); // Upload temporaire avant envoi à Cloudinary
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Nom de fichier unique
  }
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|pdf/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers .jpg, .png, .jpeg, .pdf sont autorisés.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite : 10MB
  fileFilter: fileFilter
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'documents', maxCount: 10 }
]);

// --- Route GET : afficher le formulaire d'inscription ---
router.get('/inscription', (req, res) => {
  res.render('public/inscription', { error: null, success: null, formData: {} });
});

// --- Route POST : traiter le formulaire d'inscription ---
router.post('/inscription', upload, inscriptionController.handleInscription);

module.exports = router;
