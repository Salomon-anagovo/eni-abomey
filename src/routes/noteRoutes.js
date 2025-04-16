import express from 'express';
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  genererBulletin
} from '../controllers/noteController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('secretaire', 'admin', 'formateur'), getNotes)
  .post(authorize('formateur', 'admin'), createNote);

router.route('/:id')
  .get(authorize('secretaire', 'admin', 'formateur'), getNote)
  .put(authorize('formateur', 'admin'), updateNote)
  .delete(authorize('admin'), deleteNote);

router.route('/bulletin/:eleveId')
  .get(authorize('secretaire', 'admin', 'formateur'), genererBulletin);

export default router;