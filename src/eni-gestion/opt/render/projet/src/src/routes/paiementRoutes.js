import express from 'express';
import {
  getPaiements,
  getPaiement,
  createPaiement,
  genererRecu,
  getPaiementsEleve,
  statsPaiements
} from '../controllers/paiementController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('comptable', 'admin'), getPaiements)
  .post(authorize('comptable', 'admin'), createPaiement);

router.route('/stats')
  .get(authorize('comptable', 'admin'), statsPaiements);

router.route('/:id')
  .get(authorize('comptable', 'admin'), getPaiement);

router.route('/:id/recu')
  .get(authorize('comptable', 'admin', 'secretaire'), genererRecu);

router.route('/eleve/:eleveId')
  .get(authorize('comptable', 'admin', 'secretaire'), getPaiementsEleve);

export default router;