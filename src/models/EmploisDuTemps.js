const mongoose = require('mongoose');

const EmploiDuTempsSchema = new mongoose.Schema({
  niveau: { type: String, required: true },
  anneeScolaire: { type: String, required: true },
  semestre: { type: Number, required: true, min: 1, max: 2 },
  jours: [{
    nom: { 
      type: String, 
      enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'], 
      required: true 
    },
    creneaux: [{
      heureDebut: { type: String, required: true },
      heureFin: { type: String, required: true },
      cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Cours' },
      salle: String,
      type: { type: String, enum: ['cours', 'TD', 'TP'] }
    }]
  }],
  validePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateValidation: Date,
  statut: { type: String, enum: ['provisoire', 'validé'], default: 'provisoire' }
}, { timestamps: true });

module.exports = mongoose.model('EmploiDuTemps', EmploiDuTempsSchema);