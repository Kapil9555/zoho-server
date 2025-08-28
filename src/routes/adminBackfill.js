import { Router } from "express";
import { backfillAll } from "../services/zohoBooksBackfillAll.js";
const router = Router();

// POST /api/admin/zoho/backfill-all
router.post("/admin/zoho/backfill-all", async (_req, res) => {
  try {
    const r = await backfillAll();
    res.json({ status: "OK", ...r });
  } catch (e) {
    res.status(500).json({ status: "ERROR", message: e?.message || String(e) });
  }
});

export default router;
