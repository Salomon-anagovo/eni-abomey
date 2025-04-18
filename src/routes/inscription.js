const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const inscriptionController = require('../controllers/inscriptionController');

// Configuration de multer pour l'upload des fichiers (photo et documents)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'tmp/'); // Dossier temporaire pour l'upload avant Cloudinary
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Extension du fichier
    cb(null, Date.now() + ext); // On utilise un nom unique basé sur le timestamp
  }
});

// Filtre des fichiers autorisés
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|pdf/; // Types de fichiers autorisés
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers .jpg, .png, .jpeg, .pdf sont autorisés.'));
  }
};

// Création d'un middleware multer pour gérer les fichiers
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite la taille des fichiers à 10MB
  fileFilter: fileFilter
}).fields([
  { name: 'photo', maxCount: 1 }, // Photo de profil
  { name: 'documents', maxCount: 10 } // Documents (maximum 10 fichiers)
]);

// Route d'inscription - POST
router.post('/inscription', upload, inscriptionController.handleInscription);

module.exports = router;
