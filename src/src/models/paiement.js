const mongoose = require('mongoose');

const PaiementSchema = new mongoose.Schema({
  eleve: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Eleve', 
    required: true 
  },
  anneeScolaire: { type: String, required: true },
  typeFrais: { 
    type: String, 
    enum: ['inscription', 'scolarite', 'bibliotheque', 'divers'], 
    required: true 
  },
  montant: { type: Number, required: true, min: 0 },
  montantPaye: { type: Number, required: true, min: 0 },
  datePaiement: { type: Date, default: Date.now },
  modePaiement: { 
    type: String, 
    enum: ['espèces', 'chèque', 'virement', 'mobile money'], 
    required: true 
  },
  reference: String,
  enregistrePar: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  commentaire: String
}, { timestamps: true });

module.exports = mongoose.model('Paiement', PaiementSchema);