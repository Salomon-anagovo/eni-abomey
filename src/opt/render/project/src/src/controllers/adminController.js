import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Obtenir les statistiques globales
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
export const getStats = asyncHandler(async (req, res, next) => {
  const stats = {
    eleves: await Eleve.countDocuments(),
    formateurs: await Formateur.countDocuments(),
    livres: await Livre.countDocuments(),
    pretsActifs: await Pret.countDocuments({ statut: 'en cours' }),
    paiementsMois: await Paiement.aggregate([
      {
        $match: {
          datePaiement: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$montantPaye' }
        }
      }
    ])
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Gérer les comptes utilisateurs
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new ErrorResponse(`Utilisateur non trouvé avec l'ID ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});