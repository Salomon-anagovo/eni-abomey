import express from 'express';
import {
  archiverDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  telechargerDocument,
  searchDocuments,
  getDocumentVersions,
  restoreVersion
} from '../controllers/archiveController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../utils/fileUpload.js';

const router = express.Router();

// Middleware de protection appliqué à toutes les routes
router.use(protect);

// Routes principales pour les documents archivés
router.route('/')
  .get(
    authorize('archiviste', 'admin', 'secretaire'), 
    getDocuments
  )
  .post(
    authorize('archiviste', 'admin'),
    upload.single('fichier'), 
    archiverDocument
  );

router.route('/search')
  .get(
    authorize('archiviste', 'admin', 'secretaire'),
    searchDocuments
  );

// Routes pour un document spécifique
router.route('/:id')
  .get(
    authorize('archiviste', 'admin', 'secretaire'),
    getDocument
  )
  .put(
    authorize('archiviste', 'admin'),
    updateDocument
  )
  .delete(
    authorize('admin'), // Seul l'admin peut supprimer définitivement
    deleteDocument
  );

// Téléchargement de document
router.route('/:id/download')
  .get(
    authorize('archiviste', 'admin', 'secretaire'),
    telechargerDocument
  );

// Gestion des versions
router.route('/:id/versions')
  .get(
    authorize('archiviste', 'admin'),
    getDocumentVersions
  );

router.route('/:id/restore/:versionId')
  .put(
    authorize('archiviste', 'admin'),
    restoreVersion
  );

export default router;