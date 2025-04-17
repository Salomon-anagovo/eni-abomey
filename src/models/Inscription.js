// models/Inscription.js
const mongoose = require('mongoose');

const inscriptionSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telephone: { type: String, required: true },
  pays: { type: String, required: true },
  role: { type: String, enum: ['eleve', 'formateur', 'admin', 'autre'], required: true },
  dateInscription: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inscription', inscriptionSchema);
