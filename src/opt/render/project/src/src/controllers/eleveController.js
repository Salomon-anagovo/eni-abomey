import Eleve from '../models/Eleve.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';
import generateMatricule from '../utils/generateMatricule.js';

// @desc    Récupérer tous les élèves
// @route   GET /api/v1/eleves
// @access  Private/Secretaire
export const getEleves = asyncHandler(async (req, res, next) => {
  // Filtrage, pagination, etc.
  res.status(200).json(res.advancedResults);
});

// @desc    Créer un élève
// @route   POST /api/v1/eleves
// @access  Private/Secretaire
export const createEleve = asyncHandler(async (req, res, next) => {
  // Génération du matricule
  const matricule = await generateMatricule();

  // Création de l'élève
  const eleve = await Eleve.create({
    ...req.body,
    matricule,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: eleve
  });
});

// @desc    Mettre à jour un élève
// @route   PUT /api/v1/eleves/:id
// @access  Private/Secretaire
export const updateEleve = asyncHandler(async (req, res, next) => {
  let eleve = await Eleve.findById(req.params.id);

  if (!eleve) {
    return next(new ErrorResponse(`Élève non trouvé avec l'ID ${req.params.id}`, 404));
  }

  // Vérification des autorisations
  if (eleve.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Non autorisé à modifier cet élève', 403));
  }

  eleve = await Eleve.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: eleve
  });
});