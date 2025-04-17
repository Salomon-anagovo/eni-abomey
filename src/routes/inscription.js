// routes/inscription.js
const express = require('express');
const router = express.Router();
const inscriptionController = require('../controllers/inscriptionController');

// Route POST pour enregistrement
router.post('/', inscriptionController.enregistrerInscription);

module.exports = router;
