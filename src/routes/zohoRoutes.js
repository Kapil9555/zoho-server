import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  getPurchaseOrders,
  getPurchaseOrderById,
  getBills,
  getBillById,
  getPurchaseOrdersByRef,
  getDashboard,
} from '../controllers/zohoController.js';

const router = express.Router();

// Invoices
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.get('/dashboard', getDashboard);


// Purchase Orders
router.get('/purchase-orders', getPurchaseOrders);
router.get('/purchase-orders/:id', getPurchaseOrderById);

router.get('/purchaseorders/by-ref', getPurchaseOrdersByRef);

// Bills
router.get('/bills', getBills);
router.get('/bills/:id', getBillById);

export default router;
