import express from 'express';
import {
  getLivres,
  getLivre,
  createLivre,
  updateLivre,
  deleteLivre,
  getPrets,
  createPret,
  retourPret,
  getLivresDisponibles
} from '../controllers/bibliothequeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Routes pour les livres
router.route('/livres')
  .get(authorize('bibliothecaire', 'admin', 'etudiant'), getLivres)
  .post(authorize('bibliothecaire', 'admin'), createLivre);

router.route('/livres/disponibles')
  .get(authorize('bibliothecaire', 'admin', 'etudiant'), getLivresDisponibles);

router.route('/livres/:id')
  .get(authorize('bibliothecaire', 'admin', 'etudiant'), getLivre)
  .put(authorize('bibliothecaire', 'admin'), updateLivre)
  .delete(authorize('admin'), deleteLivre);

// Routes pour les prêts
router.route('/prets')
  .get(authorize('bibliothecaire', 'admin'), getPrets)
  .post(authorize('bibliothecaire', 'admin'), createPret);

router.route('/prets/:id/retour')
  .put(authorize('bibliothecaire', 'admin'), retourPret);

export default router;