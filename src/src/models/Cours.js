const mongoose = require('mongoose');

const CoursSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  intitule: { type: String, required: true },
  description: String,
  credit: { type: Number, required: true, min: 1 },
  niveau: { type: String, required: true },
  semestre: { type: Number, required: true, min: 1, max: 2 },
  formateur: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Formateur' 
  },
  programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Programme',
    required: true
  },
  horaires: [{
    jour: { 
      type: String, 
      enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] 
    },
    heureDebut: String,
    heureFin: String,
    salle: String
  }],
  statut: { type: String, enum: ['actif', 'inactif'], default: 'actif' }
}, { timestamps: true });

module.exports = mongoose.model('Cours', CoursSchema);