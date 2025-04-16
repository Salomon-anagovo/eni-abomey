const mongoose = require('mongoose');

const FraisSchema = new mongoose.Schema({
  anneeScolaire: { type: String, required: true },
  niveau: { type: String, required: true },
  typeFrais: { 
    type: String, 
    enum: ['inscription', 'scolarite', 'bibliotheque', 'divers'], 
    required: true 
  },
  montant: { type: Number, required: true, min: 0 },
  description: String,
  dateDebut: { type: Date, required: true },
  dateFin: Date,
  statut: { type: String, enum: ['actif', 'inactif'], default: 'actif' },
  creePar: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Frais', FraisSchema);