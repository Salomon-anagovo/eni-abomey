const mongoose = require('mongoose');

const FormateurSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  specialite: { type: String, required: true },
  grade: { 
    type: String, 
    enum: ['Assistant', 'Professeur', 'Maitre-Assistant', 'Professeur Titulaire'],
    required: true 
  },
  dateEmbauche: { type: Date, required: true },
  cours: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours'
  }],
  heuresTravail: {
    heuresSemaine: { type: Number, default: 0 },
    heuresMois: { type: Number, default: 0 }
  },
  evaluations: [{
    date: { type: Date, default: Date.now },
    note: { type: Number, min: 0, max: 20 },
    commentaire: String,
    evaluateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  statut: { 
    type: String, 
    enum: ['actif', 'inactif', 'congé', 'retraité'], 
    default: 'actif' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Formateur', FormateurSchema);