import Invoice from "../models/Invoice.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

/** GET /api/invoices?search=&page=1&limit=25 */
export async function listInvoices(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "25", 10), 1), 200);
    const search = (req.query.search || "").trim();

    const filter = search
      ? { $or: [ { invoice_number: new RegExp(search, "i") }, { customer_name: new RegExp(search, "i") } ] }
      : {};

    const [items, total] = await Promise.all([
      Invoice.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Invoice.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

/** GET /api/purchaseorders?search=&page=1&limit=25 */
export async function listPOs(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "25", 10), 1), 200);
    const search = (req.query.search || "").trim();

    const filter = search
      ? { $or: [ { purchaseorder_number: new RegExp(search, "i") }, { vendor_name: new RegExp(search, "i") } ] }
      : {};

    const [items, total] = await Promise.all([
      PurchaseOrder.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      PurchaseOrder.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
