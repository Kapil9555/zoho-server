import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    // Store EVERY field from Zoho as-is (strict:false)
    fetchedAt: { type: Date, default: Date.now }
  },
  {
    collection: "zoho_invoices",
    strict: false,
    timestamps: true
  }
);

// Unique key from Zoho payload:
InvoiceSchema.index({ invoice_id: 1 }, { unique: true });

export default mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
