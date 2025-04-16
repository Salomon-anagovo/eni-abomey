import mongoose from 'mongoose';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import mongooseDelete from 'mongoose-delete';

const readFileAsync = promisify(fs.readFile);

const documentArchiveSchema = new mongoose.Schema({
  // Métadonnées de base
  reference: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    default: function() {
      return `DOC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    }
  },
  titre: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true,
    maxlength: [200, 'Le titre ne peut excéder 200 caractères']
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['administratif', 'pédagogique', 'comptable', 'juridique', 'autre'],
    required: true,
    index: true
  },

  // Fichier et stockage
  fichier: {
    type: String,
    required: true,
    get: value => `/api/v1/archives/download/${value}`
  },
  format: {
    type: String,
    required: true
  },
  taille: {
    type: Number,
    required: true,
    min: 1
  },
  checksum: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[a-f0-9]{64}$/.test(v);
      },
      message: 'Le checksum doit être un hash SHA-256 valide'
    }
  },

  // Classification
  motsCles: {
    type: [String],
    trim: true,
    index: true
  },
  confidentialite: {
    type: String,
    enum: ['public', 'interne', 'confidentiel', 'secret'],
    default: 'interne',
    index: true
  },
  dateCreationDocument: {
    type: Date,
    required: true
  },
  dateArchivage: {
    type: Date,
    default: Date.now
  },

  // Gestion des versions
  versions: [{
    numero: {
      type: Number,
      required: true
    },
    fichier: String,
    checksum: String,
    taille: Number,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    commentaire: String
  }],
  currentVersion: {
    type: Number,
    default: 1
  },

  // Signatures électroniques
  signatures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Signature'
  }],
  statutSignature: {
    type: String,
    enum: ['non-signé', 'en-attente', 'signé-partiel', 'signé-complet', 'rejeté'],
    default: 'non-signé',
    index: true
  },
  exigenceSignature: {
    type: {
      required: Boolean,
      minSignataires: Number,
      roles: [String] // ['directeur', 'comptable', ...]
    },
    default: {
      required: false,
      minSignataires: 0,
      roles: []
    }
  },

  // Métadonnées administratives
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceOrigine: {
    type: String,
    required: true,
    enum: ['direction', 'scolarité', 'comptabilité', 'pédagogie', 'bibliothèque']
  },
  retention: {
    duree: {
      type: Number, // en années
      required: true,
      default: 10
    },
    dateDestruction: Date,
    motifConservation: String
  },

  // Historique et audit
  historiqueConsultation: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['consultation', 'téléchargement', 'modification']
    },
    ipAdresse: String,
    userAgent: String
  }],

  // Relations
  relatedDocuments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentArchive'
  }],
  eleveConcerne: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Eleve'
  },
  formateurConcerne: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formateur'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

// Middleware pour calculer le checksum avant sauvegarde
documentArchiveSchema.pre('save', async function(next) {
  if (!this.isModified('fichier')) return next();

  try {
    const filePath = path.join(process.cwd(), 'public', this.fichier);
    const fileBuffer = await readFileAsync(filePath);
    this.checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    next();
  } catch (err) {
    next(err);
  }
});

// Middleware pour gérer la suppression
documentArchiveSchema.pre('deleteOne', { document: true }, async function(next) {
  // Archivage avant suppression (si soft delete activé)
  this.historiqueConsultation.push({
    action: 'suppression',
    utilisateur: this._conditions.deletedBy
  });
  next();
});

// Plugin pour soft delete
documentArchiveSchema.plugin(mongooseDelete, { 
  deletedAt: true,
  deletedBy: true,
  overrideMethods: 'all'
});

// Index pour la recherche full-text
documentArchiveSchema.index({
  titre: 'text',
  description: 'text',
  motsCles: 'text'
});

// Méthode pour vérifier l'intégrité du fichier
documentArchiveSchema.methods.verifierIntegrite = async function() {
  const filePath = path.join(process.cwd(), 'public', this.fichier);
  const fileBuffer = await readFileAsync(filePath);
  const currentChecksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  return currentChecksum === this.checksum;
};

// Méthode pour ajouter une nouvelle version
documentArchiveSchema.methods.ajouterVersion = async function(fichier, user, commentaire = '') {
  const version = {
    numero: this.currentVersion + 1,
    fichier,
    modifiedBy: user,
    commentaire
  };

  // Calcul du checksum pour la nouvelle version
  const filePath = path.join(process.cwd(), 'public', fichier);
  const fileBuffer = await readFileAsync(filePath);
  version.checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  version.taille = fileBuffer.length;

  this.versions.push(version);
  this.currentVersion = version.numero;
  return this.save();
};

const DocumentArchive = mongoose.model('DocumentArchive', documentArchiveSchema);
export default DocumentArchive;