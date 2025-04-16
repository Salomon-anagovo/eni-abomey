import express from 'express';
import {
  getFormateurs,
  getFormateur,
  createFormateur,
  updateFormateur,
  deleteFormateur,
  assignerCours,
  getFormateurCours
} from '../controllers/formateurController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'secretaire'), getFormateurs)
  .post(authorize('admin'), createFormateur);

router.route('/:id')
  .get(authorize('admin', 'secretaire', 'formateur'), getFormateur)
  .put(authorize('admin'), updateFormateur)
  .delete(authorize('admin'), deleteFormateur);

router.route('/:id/cours')
  .get(authorize('admin', 'secretaire', 'formateur'), getFormateurCours)
  .post(authorize('admin'), assignerCours);

export default router;