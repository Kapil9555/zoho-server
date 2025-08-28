import express from 'express';
import { isAdmin, protect } from '../middlewares/authMiddleware.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = express.Router();

// GET /api/admin/dashboard
router.get('/', protect, isAdmin, getDashboardStats);

export default router;
