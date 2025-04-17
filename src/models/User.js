const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Veuillez entrer votre nom'],
    trim: true,
    maxlength: 50
  },
  prenom: {
    type: String,
    required: [true, 'Veuillez entrer votre prénom'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Veuillez entrer votre email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Veuillez entrer un mot de passe'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'secretaire', 'formateur', 'etudiant'],
    default: 'etudiant'
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true,
    select: false
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true } 
});

// Middleware de hachage du mot de passe
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Méthodes d'instance
userSchema.methods = {
  comparePassword: async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  },

  generateAuthToken: function() {
    return jwt.sign(
      { id: this._id, role: this.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
  },

  generatePasswordResetToken: function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
  }
};

// Export du modèle
module.exports = mongoose.model('User', userSchema);
