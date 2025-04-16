import Formateur from '../models/Formateur.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Créer un formateur
// @route   POST /api/v1/formateurs
// @access  Private/Admin
export const createFormateur = asyncHandler(async (req, res, next) => {
  // Création du compte utilisateur
  const user = await User.create({
    ...req.body.userData,
    role: 'formateur'
  });

  // Création du profil formateur
  const formateur = await Formateur.create({
    ...req.body.formateurData,
    user: user._id
  });

  res.status(201).json({
    success: true,
    data: formateur
  });
});

// @desc    Attribuer des cours à un formateur
// @route   PUT /api/v1/formateurs/:id/cours
// @access  Private/Admin
export const assignerCours = asyncHandler(async (req, res, next) => {
  const formateur = await Formateur.findById(req.params.id);

  if (!formateur) {
    return next(new ErrorResponse(`Formateur non trouvé avec l'ID ${req.params.id}`, 404));
  }

  // Vérification des cours existants
  const existingCourses = formateur.coursResponsable.map(c => c.toString());
  const newCourses = req.body.cours.filter(c => !existingCourses.includes(c));

  if (newCourses.length === 0) {
    return next(new ErrorResponse('Aucun nouveau cours à attribuer', 400));
  }

  formateur.coursResponsable = [...formateur.coursResponsable, ...newCourses];
  await formateur.save();

  res.status(200).json({
    success: true,
    data: formateur
  });
});