import crypto from 'crypto';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import DocumentArchive from '../models/DocumentArchive.js';
import Signature from '../models/Signature.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';
import sendEmail from '../utils/mailer.js';
import { generateSignatureImage } from '../utils/signatureGenerator.js';

const readFileAsync = promisify(fs.readFile);

// @desc    Initier une signature électronique
// @route   POST /api/v1/signatures
// @access  Private
export const initierSignature = asyncHandler(async (req, res, next) => {
  const { documentId, signataireId } = req.body;

  // Vérification du document
  const document = await DocumentArchive.findById(documentId);
  if (!document) {
    return next(new ErrorResponse('Document non trouvé', 404));
  }

  // Génération du code OTP
  const codeOTP = crypto.randomInt(100000, 999999).toString();
  const expirationOTP = Date.now() + 15 * 60 * 1000; // 15 minutes

  // Création de l'enregistrement de signature
  const signature = await Signature.create({
    document: documentId,
    signataire: signataireId,
    certificatNumerique: generateCertificateHash(req.user),
    ipAdresse: req.ip,
    codeOTP,
    expirationOTP,
    initiePar: req.user.id
  });

  // Envoi du code OTP par email
  const message = `
    <h2>Signature électronique requise</h2>
    <p>Vous êtes invité à signer le document : <strong>${document.titre}</strong></p>
    <p>Votre code de vérification : <strong>${codeOTP}</strong></p>
    <p><em>Ce code expire dans 15 minutes</em></p>
  `;

  await sendEmail({
    email: req.user.email,
    subject: 'Code de signature électronique',
    message
  });

  res.status(201).json({
    success: true,
    data: signature
  });
});

// @desc    Valider une signature avec OTP
// @route   PUT /api/v1/signatures/:id/valider
// @access  Private
export const validerSignature = asyncHandler(async (req, res, next) => {
  const { codeOTP, signatureImage } = req.body;

  const signature = await Signature.findById(req.params.id);
  if (!signature) {
    return next(new ErrorResponse('Demande de signature non trouvée', 404));
  }

  // Vérification du code OTP
  if (signature.codeOTP !== codeOTP || signature.expirationOTP < Date.now()) {
    return next(new ErrorResponse('Code invalide ou expiré', 400));
  }

  // Génération de l'image de signature
  const signatureUrl = await generateSignatureImage(signatureImage);

  // Mise à jour de la signature
  signature.signatureImage = signatureUrl;
  signature.statut = 'signed';
  signature.dateSignature = Date.now();
  signature.codeOTP = undefined;
  signature.expirationOTP = undefined;
  await signature.save();

  // Ajout de la signature au document
  await DocumentArchive.findByIdAndUpdate(signature.document, {
    $push: { signatures: signature._id },
    $set: { statut: 'signé' }
  });

  res.status(200).json({
    success: true,
    data: signature
  });
});

// @desc    Vérifier l'authenticité d'une signature
// @route   GET /api/v1/signatures/:id/verifier
// @access  Public
export const verifierSignature = asyncHandler(async (req, res, next) => {
  const signature = await Signature.findById(req.params.id)
    .populate('signataire', 'nom prenom email')
    .populate('document', 'titre reference');

  if (!signature) {
    return next(new ErrorResponse('Signature non trouvée', 404));
  }

  // Vérification cryptographique
  const isAuthentic = verifyDigitalSignature(signature);

  res.status(200).json({
    success: true,
    data: {
      ...signature.toObject(),
      authentique: isAuthentic,
      document: signature.document
    }
  });
});

// Fonction helper pour générer un hash de certificat
const generateCertificateHash = (user) => {
  return crypto
    .createHash('sha256')
    .update(`${user.id}${user.email}${Date.now()}`)
    .digest('hex');
};