import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Veuillez entrer votre nom'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Veuillez entrer votre prénom'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Veuillez entrer votre email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez entrer un email valide'
    ]
  },
  password: {
    type: String,
    required: [true, 'Veuillez entrer un mot de passe'],
    minlength: [6, 'Le mot de passe doit avoir au moins 6 caractères'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'secretaire', 'formateur', 'bibliothecaire', 'comptable', 'etudiant'],
    required: true
  },
  photo: {
    type: String,
    default: 'default-user.jpg'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Cryptage du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Génération du JWT
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Vérification du mot de passe
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Génération du token de réinitialisation
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;