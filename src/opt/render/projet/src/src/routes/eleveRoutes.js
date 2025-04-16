import express from 'express';
import {
  getEleves,
  getEleve,
  createEleve,
  updateEleve,
  deleteEleve,
  uploadElevePhoto,
  getEleveNotes,
  getElevePaiements
} from '../controllers/eleveController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import Eleve from '../models/Eleve.js';
import advancedResults from '../middleware/advancedResults.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(
    authorize('secretaire', 'admin'),
    advancedResults(Eleve, 'promotion stage'),
    getEleves
  )
  .post(authorize('secretaire', 'admin'), createEleve);

router.route('/:id')
  .get(authorize('secretaire', 'admin', 'formateur'), getEleve)
  .put(authorize('secretaire', 'admin'), updateEleve)
  .delete(authorize('admin'), deleteEleve);

router.route('/:id/photo')
  .put(authorize('secretaire', 'admin'), uploadElevePhoto);

router.route('/:id/notes')
  .get(authorize('secretaire', 'admin', 'formateur'), getEleveNotes);

router.route('/:id/paiements')
  .get(authorize('secretaire', 'admin', 'comptable'), getElevePaiements);

export default router;