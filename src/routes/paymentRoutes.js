import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/razorpayController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// For test mode, no middleware needed
router.post('/create-order-secure',protect, createRazorpayOrder);
router.post('/verify', verifyRazorpayPayment);

export default router;
