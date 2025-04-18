const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inscriptionSchema = new Schema({
  nom: { type: String, required: true, trim: true },
  prenom: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(v);
      },
      message: props => `${props.value} n'est pas un email valide!`
    }
  },
  telephone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+?[0-9]{6,15}$/.test(v);
      },
      message: props => `${props.value} n'est pas un numéro valide!`
    }
  },
  pays: { type: String, required: true },
  indicatif: { type: String, required: true },
  dateNaissance: { type: Date, required: true },
  lieuNaissance: { type: String, required: true },
  role: {
    type: String,
    enum: ['eleve', 'formateur', 'administration', 'autres'],
    default: 'eleve'
  },
  photo: {
    url: { type: String, required: true },
    public_id: { type: String, required: true }
  },
  documents: [{
    url: { type: String },
    public_id: { type: String }
  }],
  password: { type: String, required: true, select: false },
  conditions: { type: Boolean, required: true, default: false },
  confirmed: { type: Boolean, default: false },
  confirmationToken: { type: String },
  dateInscription: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.confirmationToken;
      return ret;
    }
  }
});

module.exports = mongoose.model('Inscription', inscriptionSchema);
