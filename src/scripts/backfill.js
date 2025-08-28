import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { backfillAll } from "../services/zohoBooksBackfillAll.js";

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);

  console.log("Starting full backfill (invoices + purchase orders)...");

  const result = await backfillAll();
  
  console.log("Backfill finished:", JSON.stringify(result, null, 2));

  await mongoose.disconnect();
}
main().catch((e) => {
  console.error("Backfill failed:", e?.message || e);
  process.exit(1);
});
