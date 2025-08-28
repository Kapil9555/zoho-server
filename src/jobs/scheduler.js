import cron from "node-cron";
import mongoose from "mongoose";
import { runNightlyBooksSync } from "../services/zohoBooksSync.js";

const MONGODB_URI = process.env.MONGO_URI;

export async function startSchedulers() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI missing");
  await mongoose.connect(MONGODB_URI);

  // Run daily at 22:30 IST

  cron.schedule(
    // "00 10 * * *",
    "30 22 * * *",
    // "* * * * *",
    async () => {
      try {
        console.log("[ZohoBooks] sync start");
        const res = await runNightlyBooksSync();
        console.log("[ZohoBooks] sync done:", res);
      } catch (e) {
        console.error("[ZohoBooks] sync failed:", e?.message || e);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  console.log("Scheduler started: 22:30 Asia/Kolkata");
}
