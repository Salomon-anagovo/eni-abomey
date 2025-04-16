const mongoose = require('mongoose');

const PersonnelSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  poste: { type: String, required: true },
  departement: { type: String, required: true },
  dateEmbauche: { type: Date, required: true },
  typeContrat: { 
    type: String, 
    enum: ['CDI', 'CDD', 'stagiaire', 'vacataire'], 
    required: true 
  },
  salaire: Number,
  conges: [{
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date, required: true },
    type: { 
      type: String, 
      enum: ['annuel', 'maladie', 'maternité', 'exceptionnel'] 
    },
    statut: { 
      type: String, 
      enum: ['en attente', 'approuvé', 'rejeté'], 
      default: 'en attente' 
    },
    justificatif: String
  }],
  taches: [{
    description: { type: String, required: true },
    dateDebut: Date,
    dateEcheance: Date,
    priorite: { type: String, enum: ['basse', 'moyenne', 'haute'] },
    statut: { type: String, enum: ['à faire', 'en cours', 'terminé'], default: 'à faire' }
  }],
  evaluations: [{
    date: { type: Date, default: Date.now },
    evaluateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    commentaire: String,
    note: { type: Number, min: 0, max: 20 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Personnel', PersonnelSchema);