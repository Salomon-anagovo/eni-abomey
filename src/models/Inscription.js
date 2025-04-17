const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const inscriptionSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telephone: { type: String, required: true },
  pays: { type: String, required: true },
  role: { type: String, enum: ['eleve', 'formateur', 'admin', 'autre'], required: true },
  password: { type: String, required: true },
  dateInscription: { type: Date, default: Date.now }
});

inscriptionSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('Inscription', inscriptionSchema);