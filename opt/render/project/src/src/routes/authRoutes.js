import express from 'express';
import {
  login,
  logout,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Routes protégées
router.use(protect);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);

export default router;