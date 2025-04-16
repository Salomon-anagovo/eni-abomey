import express from 'express';
import {
  getStages,
  getStage,
  createStage,
  updateStage,
  deleteStage,
  evaluerStage,
  getStagesEleve
} from '../controllers/stageController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('secretaire', 'admin', 'formateur'), getStages)
  .post(authorize('secretaire', 'admin'), createStage);

router.route('/:id')
  .get(authorize('secretaire', 'admin', 'formateur'), getStage)
  .put(authorize('secretaire', 'admin'), updateStage)
  .delete(authorize('admin'), deleteStage);

router.route('/:id/evaluation')
  .put(authorize('formateur', 'admin'), evaluerStage);

router.route('/eleve/:eleveId')
  .get(authorize('secretaire', 'admin', 'formateur'), getStagesEleve);

export default router;