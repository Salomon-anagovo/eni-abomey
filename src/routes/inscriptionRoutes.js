const express = require('express');
const router = express.Router();
const multer = require('multer');
const inscriptionController = require('../controllers/inscriptionController');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Max 5 fichiers
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'), false);
    }
  }
});

router.get('/', (req, res) => {
  res.render('public/inscription', {
    title: 'Inscription',
    currentYear: new Date().getFullYear(),
    formData: {},
    success: req.query.success,
    error: req.query.error
  });
});

router.post('/',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'documents', maxCount: 4 }
  ]),
  inscriptionController.handleInscription
);

module.exports = router;