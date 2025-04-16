import DocumentArchive from '../models/DocumentArchive.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';
import fs from 'fs';
import path from 'path';

// @desc    Archiver un document
// @route   POST /api/v1/archives
// @access  Private/Admin
export const archiverDocument = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Veuillez uploader un fichier', 400));
  }

  const document = await DocumentArchive.create({
    titre: req.body.titre,
    description: req.body.description,
    type: req.body.type,
    fichier: req.file.path,
    format: req.file.mimetype,
    taille: req.file.size,
    motsCles: req.body.motsCles ? req.body.motsCles.split(',') : [],
    confidentialite: req.body.confidentialite || 'interne',
    createur: req.user.id
  });

  res.status(201).json({
    success: true,
    data: document
  });
});

// @desc    Télécharger un document archivé
// @route   GET /api/v1/archives/:id/download
// @access  Private (Permissions gérées par le modèle)
export const telechargerDocument = asyncHandler(async (req, res, next) => {
  const document = await DocumentArchive.findById(req.params.id);

  if (!document) {
    return next(new ErrorResponse('Document non trouvé', 404));
  }

  // Vérification des permissions
  if (!req.user.roles.includes('admin') && 
      document.confidentialite === 'confidentiel') {
    return next(new ErrorResponse('Non autorisé', 403));
  }

  // Vérification de l'existence du fichier
  if (!fs.existsSync(document.fichier)) {
    return next(new ErrorResponse('Fichier non trouvé', 404));
  }

  // Enregistrement de la consultation
  document.historiqueConsultation.push({
    utilisateur: req.user.id,
    action: 'téléchargement'
  });
  await document.save();

  res.download(document.fichier);
});