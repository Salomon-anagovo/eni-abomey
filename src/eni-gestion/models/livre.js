const mongoose = require('mongoose');

const LivreSchema = new mongoose.Schema({
  isbn: { type: String, required: true, unique: true },
  titre: { type: String, required: true },
  auteur: { type: String, required: true },
  editeur: String,
  anneePublication: Number,
  edition: String,
  categorie: { type: String, required: true },
  description: String,
  langue: { type: String, default: 'Français' },
  motsCles: [String],
  exemplaires: [{
    codeBarre: { type: String, required: true, unique: true },
    statut: { 
      type: String, 
      enum: ['disponible', 'emprunté', 'réservé', 'perdu', 'en réparation'], 
      default: 'disponible' 
    },
    dateAcquisition: { type: Date, default: Date.now },
    localisation: String
  }],
  imageCouverture: String
}, { timestamps: true });

module.exports = mongoose.model('Livre', LivreSchema);