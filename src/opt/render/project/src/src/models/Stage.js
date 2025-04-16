const mongoose = require('mongoose');

const StageSchema = new mongoose.Schema({
  eleve: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Eleve', 
    required: true 
  },
  entreprise: {
    nom: { type: String, required: true },
    adresse: String,
    secteur: String,
    tuteur: {
      nom: String,
      poste: String,
      email: String,
      telephone: String
    }
  },
  periode: {
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date, required: true }
  },
  sujet: { type: String, required: true },
  encadreur: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Formateur' 
  },
  evaluation: {
    note: { type: Number, min: 0, max: 20 },
    appreciation: String,
    dateEvaluation: Date
  },
  documents: [{
    type: { type: String, required: true },
    url: { type: String, required: true }
  }],
  statut: { 
    type: String, 
    enum: ['en préparation', 'en cours', 'terminé', 'évalué'], 
    default: 'en préparation' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Stage', StageSchema);