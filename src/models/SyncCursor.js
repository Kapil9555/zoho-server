import mongoose from "mongoose";

const SyncCursorSchema = new mongoose.Schema(
  {
    source: { type: String, default: "zoho-books" },
    module: { type: String, required: true, index: true }, 
    lastSyncAt: { type: Date },
    running: { type: Boolean, default: false },
    lastError: String
  },
  { collection: "zoho_sync_cursors",timestamps:true }
);

export default mongoose.models.SyncCursor || mongoose.model("SyncCursor", SyncCursorSchema);
