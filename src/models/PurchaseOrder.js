import mongoose from "mongoose";

const PurchaseOrderSchema = new mongoose.Schema(
  {
    fetchedAt: { type: Date, default: Date.now }
  },
  {
    collection: "zoho_purchaseorders",
    strict: false,
    timestamps: true
  }
);

PurchaseOrderSchema.index({ purchaseorder_id: 1 }, { unique: true });

export default mongoose.models.PurchaseOrder
  || mongoose.model("PurchaseOrder", PurchaseOrderSchema);
