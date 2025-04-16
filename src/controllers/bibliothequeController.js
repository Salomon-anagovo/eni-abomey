import Livre from '../models/Livre.js';
import Pret from '../models/Pret.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Enregistrer un nouveau livre
// @route   POST /api/v1/bibliotheque/livres
// @access  Private/Bibliothecaire
export const enregistrerLivre = asyncHandler(async (req, res, next) => {
  const { exemplaires, ...livreData } = req.body;

  // Création du livre avec ses exemplaires
  const livre = await Livre.create({
    ...livreData,
    exemplaires: exemplaires.map(ex => ({
      ...ex,
      statut: 'disponible'
    }))
  });

  res.status(201).json({
    success: true,
    data: livre
  });
});

// @desc    Enregistrer un emprunt
// @route   POST /api/v1/bibliotheque/prets
// @access  Private/Bibliothecaire
export const enregistrerEmprunt = asyncHandler(async (req, res, next) => {
  const { exemplaireId, emprunteurId, emprunteurType, dateRetourPrevu } = req.body;

  // Vérification de l'exemplaire
  const livre = await Livre.findOne({ 'exemplaires._id': exemplaireId });
  if (!livre) {
    return next(new ErrorResponse('Exemplaire non trouvé', 404));
  }

  const exemplaire = livre.exemplaires.id(exemplaireId);
  if (exemplaire.statut !== 'disponible') {
    return next(new ErrorResponse('Cet exemplaire n\'est pas disponible', 400));
  }

  // Création du prêt
  const pret = await Pret.create({
    exemplaire: exemplaireId,
    emprunteur: emprunteurId,
    emprunteurModel: emprunteurType,
    dateRetourPrevu,
    traitePar: req.user.id
  });

  // Mise à jour du statut de l'exemplaire
  exemplaire.statut = 'emprunté';
  await livre.save();

  res.status(201).json({
    success: true,
    data: pret
  });
});