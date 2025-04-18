const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inscriptionSchema = new Schema({
  // Informations personnelles
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
        return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(v);
      },
      message: props => `${props.value} n'est pas une adresse email valide !`
    }
  },

  // Pays avant le numéro de téléphone et l'indicatif
  pays: {
    type: String,
    required: true
  },
  indicatif: {
    type: String,
    required: true
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

  dateNaissance: {
    type: Date,
    required: true
  },
  lieuNaissance: {
    type: String,
    required: true
  },

  // Informations de sécurité
  password: {
    type: String,
    required: true
  },
  conditions: {
    type: Boolean,
    required: true
  },

  // Rôle et confirmation
  role: {
    type: String,
    enum: ['eleve', 'formateur', 'administration', 'autres'],
    default: 'eleve'
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  confirmationToken: {
    type: String
  },

  // Stockage des fichiers
  photo: {
    url: { type: String, required: true },
    public_id: { type: String, required: true }
  },
  documents: [{
    url: { type: String },
    public_id: { type: String }
  }],

  // Informations supplémentaires
  dateInscription: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Inscription = mongoose.model('Inscription', inscriptionSchema);

module.exports = Inscription;
