import express from 'express';
import {
  getStats,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);

router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.put('/users/:id/role', updateUserRole);

export default router;