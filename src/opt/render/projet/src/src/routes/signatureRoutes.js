import express from 'express';
import {
  initierSignature,
  validerSignature,
  verifierSignature,
  getSignaturesDocument,
  annulerSignature
} from '../controllers/signatureController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('archiviste', 'admin'), initierSignature);

router.route('/:id/valider')
  .put(authorize('archiviste', 'admin', 'secretaire'), validerSignature);

router.route('/:id/verifier')
  .get(verifierSignature); // Public

router.route('/:id/annuler')
  .put(authorize('admin'), annulerSignature);

router.route('/document/:documentId')
  .get(authorize('archiviste', 'admin'), getSignaturesDocument);

export default router;