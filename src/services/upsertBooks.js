import Invoice from "../models/Invoice.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

export async function bulkUpsertInvoices(invoices = []) {
  if (!invoices.length) return { upserted: 0 };
  const ops = invoices.map((inv) => ({
    updateOne: {
      filter: { invoice_id: inv.invoice_id },
      update: { $set: { ...inv, fetchedAt: new Date() } },
      upsert: true
    }
  }));

  const r = await Invoice.bulkWrite(ops, { ordered: false });

  return { upserted: (r.upsertedCount || 0) + (r.modifiedCount || 0) };
  
}

export async function bulkUpsertPOs(pos = []) {
  if (!pos.length) return { upserted: 0 };
  const ops = pos.map((po) => ({
    updateOne: {
      filter: { purchaseorder_id: po.purchaseorder_id },
      update: { $set: { ...po, fetchedAt: new Date() } },
      upsert: true
    }
  }));
  const r = await PurchaseOrder.bulkWrite(ops, { ordered: false });
  return { upserted: (r.upsertedCount || 0) + (r.modifiedCount || 0) };
}
