import mongoose from 'mongoose';

const signatureSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentArchive',
    required: true
  },
  signataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  signatureImage: {
    type: String, // URL vers l'image de signature
    required: true
  },
  certificatNumerique: {
    type: String, // Empreinte numérique du certificat
    required: true
  },
  dateSignature: {
    type: Date,
    default: Date.now
  },
  ipAdresse: String,
  statut: {
    type: String,
    enum: ['pending', 'signed', 'rejected', 'expired'],
    default: 'pending'
  },
  codeOTP: String,
  expirationOTP: Date
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
signatureSchema.index({ document: 1, signataire: 1 });
signatureSchema.index({ statut: 1, dateSignature: 1 });

const Signature = mongoose.model('Signature', signatureSchema);
export default Signature;