// routes/inventoryRoutes.js
import express from 'express';
import {
  getInventory,
  adjustStock,
  getInventoryLogs,
} from '../controllers/inventoryController.js';
import { isAdmin, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, isAdmin, getInventory);
router.post('/adjust', protect, isAdmin, adjustStock);
router.get('/logs/:productId', protect, isAdmin, getInventoryLogs);

export default router;
