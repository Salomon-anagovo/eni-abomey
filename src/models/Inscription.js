const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Définition du modèle Inscription
const inscriptionSchema = new Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(v);
      },
      message: props => `${props.value} n'est pas une adresse email valide !`
    }
  },
  telephone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{6,15}$/.test(v);
      },
      message: props => `${props.value} n'est pas un numéro de téléphone valide !`
    }
  },
  pays: {
    type: String,
    required: true
  },
  indicatif: {
    type: String,
    required: true
  },
  dateNaissance: {
    type: Date,
    required: true
  },
  lieuNaissance: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['eleve', 'formateur', 'administration', 'autres'],
    default: 'eleve'
  },
  photo: {
    type: String, // Le chemin vers l'image téléchargée
    required: true
  },
  documents: [{
    type: String // Chemin des documents téléchargés
  }],
  password: {
    type: String,
    required: true
  },
  conditions: {
    type: Boolean,
    required: true
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  confirmationToken: {
    type: String
  },
  dateInscription: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Création du modèle Inscription
const Inscription = mongoose.model('Inscription', inscriptionSchema);

module.exports = Inscription;
