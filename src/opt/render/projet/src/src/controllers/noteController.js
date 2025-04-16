import Note from '../models/Note.js';
import Eleve from '../models/Eleve.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Saisir les notes
// @route   POST /api/v1/notes
// @access  Private/Formateur
export const saisirNotes = asyncHandler(async (req, res, next) => {
  const { eleve, cours, evaluations } = req.body;

  // Vérification que le formateur enseigne ce cours
  if (req.user.role === 'formateur') {
    const formateur = await Formateur.findOne({ user: req.user.id });
    if (!formateur.coursResponsable.includes(cours)) {
      return next(new ErrorResponse('Non autorisé à saisir des notes pour ce cours', 403));
    }
  }

  // Vérification de l'existence de l'élève
  const eleveExists = await Eleve.findById(eleve);
  if (!eleveExists) {
    return next(new ErrorResponse(`Élève non trouvé avec l'ID ${eleve}`, 404));
  }

  // Création ou mise à jour de la note
  let note = await Note.findOne({ eleve, cours });

  if (note) {
    // Mise à jour des évaluations existantes
    note.evaluations = [...note.evaluations, ...evaluations];
  } else {
    // Création d'une nouvelle note
    note = new Note({
      eleve,
      cours,
      evaluations,
      anneeScolaire: eleveExists.anneeScolaire,
      semestre: req.body.semestre || 1,
      enregistrePar: req.user.id
    });
  }

  await note.save();

  res.status(201).json({
    success: true,
    data: note
  });
});

// @desc    Générer un bulletin
// @route   GET /api/v1/notes/bulletin/:eleveId
// @access  Private/Secretaire
export const genererBulletin = asyncHandler(async (req, res, next) => {
  const eleve = await Eleve.findById(req.params.eleveId);
  if (!eleve) {
    return next(new ErrorResponse(`Élève non trouvé avec l'ID ${req.params.eleveId}`, 404));
  }

  const notes = await Note.find({ eleve: eleve._id })
    .populate('cours', 'intitule credit')
    .populate('enregistrePar', 'nom prenom');

  res.status(200).json({
    success: true,
    data: {
      eleve,
      notes
    }
  });
});