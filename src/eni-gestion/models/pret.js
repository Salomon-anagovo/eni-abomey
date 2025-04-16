const mongoose = require('mongoose');

const PretSchema = new mongoose.Schema({
  exemplaire: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Livre.exemplaires', 
    required: true 
  },
  emprunteur: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'emprunteurModel',
    required: true 
  },
  emprunteurModel: { 
    type: String, 
    enum: ['User', 'Eleve'], 
    required: true 
  },
  dateEmprunt: { type: Date, default: Date.now },
  dateRetourPrevu: { type: Date, required: true },
  dateRetourEffectif: Date,
  statut: { 
    type: String, 
    enum: ['en cours', 'retourné', 'en retard', 'perdu'], 
    default: 'en cours' 
  },
  amende: { type: Number, default: 0 },
  traitePar: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

// Middleware pour calculer l'amende si retard
PretSchema.pre('save', function(next) {
  if (this.statut === 'en retard' && !this.dateRetourEffectif) {
    const joursRetard = Math.ceil((Date.now() - this.dateRetourPrevu) / (1000 * 60 * 60 * 24));
    this.amende = Math.max(0, joursRetard * 100); // 100 FCFA par jour de retard
  }
  next();
});

module.exports = mongoose.model('Pret', PretSchema);