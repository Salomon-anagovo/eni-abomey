import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Veuillez entrer votre nom'],
    trim: true,
    maxlength: [50, 'Le nom ne peut excéder 50 caractères']
  },
  prenom: {
    type: String,
    required: [true, 'Veuillez entrer votre prénom'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut excéder 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'Veuillez entrer votre email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Veuillez entrer un email valide'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Veuillez entrer un mot de passe'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false,
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
      },
      message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    }
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'secretaire', 'formateur', 'bibliothecaire', 'comptable', 'etudiant'],
      message: 'Rôle {VALUE} non valide'
    },
    required: [true, 'Veuillez spécifier un rôle'],
    default: 'etudiant'
  },
  photo: {
    type: String,
    default: 'default-user.jpg',
    validate: {
      validator: function(v) {
        return /\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Seules les images JPG, JPEG, PNG ou WEBP sont autorisées'
    }
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  lastLogin: {
    type: Date,
    select: false
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware de pré-sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Méthodes d'instance
userSchema.methods = {
  // Génération du JWT
  generateAuthToken: function() {
    return jwt.sign(
      {
        id: this._id,
        role: this.role,
        emailVerified: this.emailVerified,
        twoFactorEnabled: this.twoFactorEnabled
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRE || '24h',
        algorithm: 'HS256'
      }
    );
  },

  // Vérification du mot de passe
  comparePassword: async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  },

  // Génération du token de réinitialisation
  generatePasswordResetToken: function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
  },

  // Génération de token pour vérification email
  generateEmailVerificationToken: function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 heures

    return verificationToken;
  }
};

// Méthodes statiques
userSchema.statics = {
  // Trouver un utilisateur par email (pour l'authentification)
  findByEmail: async function(email) {
    return await this.findOne({ email }).select('+password +twoFactorSecret');
  },

  // Vérifier si un email existe déjà
  isEmailTaken: async function(email, excludeUserId) {
    const user = await this.findOne({ 
      email, 
      _id: { $ne: excludeUserId } 
    });
    return !!user;
  }
};

// Index supplémentaires
userSchema.index({ email: 1, role: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ isActive: 1 });

// Middleware de post-find
userSchema.post(/^find/, function(docs, next) {
  if (this.op === 'find') {
    docs.forEach(doc => {
      if (doc.photo && !doc.photo.startsWith('http')) {
        doc.photo = `${process.env.ASSETS_URL}/users/${doc.photo}`;
      }
    });
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;