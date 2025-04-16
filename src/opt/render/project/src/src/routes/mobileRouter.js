import express from 'express';
import { mobileAdapter } from '../middleware/mobileDetect.js';

const router = express.Router();
router.use(mobileAdapter);

router.get('/dashboard', (req, res) => {
  if(res.locals.isMobile) {
    return res.render('mobile/dashboard');
  }
  res.render('desktop/dashboard');
});