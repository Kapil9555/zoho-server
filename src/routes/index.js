import { Router } from "express";
import {
  getInvoiceById,
  getPurchaseOrderById,
  listInvoices,
  listInvoicesOnly,
  listPiSummaryOnly,
  listPOs,
} from "../controllers/salesController.js";
import Invoice from "../models/Invoice.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import adminBackfill from "./adminBackfill.js";
import {
  addSalesMember,
  deleteSalesMember,
  getSalesMemberById,
  listSalesMembers,
  updateSalesMember,
  updateSalesMemberStatus,
} from "../controllers/salesMemberController.js";

// NEW: Sales auth (single-token) imports
import {
  loginSales,
  logoutSales,
  meSales,
} from "../controllers/salesAuthController.js";
import { requireSalesAuth } from "../middlewares/salesAuth.js";


const router = Router();

/* ---------------- Sales Auth Routes (NEW) ---------------- */
// Base: /api/sales/auth
router.post("/api/sales/auth/login", loginSales);
router.post("/api/sales/auth/logout", logoutSales);
router.get("/api/sales/auth/me", requireSalesAuth, meSales);
// ^ `me` requires a valid accessToken cookie (or Bearer header)


/* ---------------- Existing routes ---------------- */
// Read routes (serve from DB; no Zoho calls here)
router.get("/api/invoices", listInvoices(Invoice, PurchaseOrder));
router.get("/api/invoices-only", listInvoicesOnly(Invoice));
router.get("/api/pi-summary", listPiSummaryOnly(Invoice, PurchaseOrder));
router.get("/api/purchaseorders", listPOs(PurchaseOrder));
router.get("/api/invoices/:id", getInvoiceById(Invoice));
router.get("/api/purchaseorders/:id", getPurchaseOrderById(PurchaseOrder));

/* Admin backfill */
router.use("/api", adminBackfill);

/* ---------------- Sales Member routes ---------------- */
// Optional: protect all /api/admin/* routes (uncomment to enable admin-only)
// router.use("/api/admin", requireSalesAuth, requireSalesRole("admin"));

// Base: /api/admin/sales-members
router
  .route("/api/admin/sales-members")
  .get(listSalesMembers)
  .post(addSalesMember);

router
  .route("/api/admin/sales-members/:id")
  .get(getSalesMemberById)
  .put(updateSalesMember)
  .delete(deleteSalesMember);

// Quick status toggle
router.patch("/api/admin/sales-members/:id/status", updateSalesMemberStatus);

export default router;
