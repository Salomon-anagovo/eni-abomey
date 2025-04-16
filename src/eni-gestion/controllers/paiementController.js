import Paiement from '../models/Paiement.js';
import Eleve from '../models/Eleve.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Enregistrer un paiement
// @route   POST /api/v1/paiements
// @access  Private/Comptable
export const enregistrerPaiement = asyncHandler(async (req, res, next) => {
  const { eleve, typeFrais, montant, modePaiement } = req.body;

  // Vérification de l'élève
  const eleveExists = await Eleve.findById(eleve);
  if (!eleveExists) {
    return next(new ErrorResponse(`Élève non trouvé avec l'ID ${eleve}`, 404));
  }

  // Enregistrement du paiement
  const paiement = await Paiement.create({
    eleve,
    typeFrais,
    montant,
    montantPaye: req.body.montantPaye || montant,
    modePaiement,
    reference: req.body.reference,
    anneeScolaire: eleveExists.anneeScolaire,
    enregistrePar: req.user.id
  });

  res.status(201).json({
    success: true,
    data: paiement
  });
});

// @desc    Générer un reçu
// @route   GET /api/v1/paiements/:id/reçu
// @access  Private/Comptable
export const genererRecu = asyncHandler(async (req, res, next) => {
  const paiement = await Paiement.findById(req.params.id)
    .populate('eleve', 'nom prenom matricule')
    .populate('enregistrePar', 'nom prenom');

  if (!paiement) {
    return next(new ErrorResponse(`Paiement non trouvé avec l'ID ${req.params.id}`, 404));
  }

  // Formatage du reçu (simplifié)
  const recu = {
    date: paiement.datePaiement.toLocaleDateString(),
    eleve: `${paiement.eleve.nom} ${paiement.eleve.prenom}`,
    matricule: paiement.eleve.matricule,
    type: paiement.typeFrais,
    montant: paiement.montantPaye,
    mode: paiement.modePaiement,
    enregistrePar: `${paiement.enregistrePar.nom} ${paiement.enregistrePar.prenom}`
  };

  res.status(200).json({
    success: true,
    data: recu
  });
});