import dayjs from "dayjs";
import { fetchAllZohoPages } from "./zohoHelpers.js";
import { bulkUpsertInvoices, bulkUpsertPOs } from "./upsertBooks.js";
import SyncCursor from "../models/SyncCursor.js";

const FULL_REFRESH_NIGHTLY = process.env.ZOHO_FULL_REFRESH === "true";

/** small helper for delta window */
function getDeltaParams(lastSyncAt) {
  const end = dayjs().format("YYYY-MM-DD");
  const start = lastSyncAt
    ? dayjs(lastSyncAt).subtract(1, "day").format("YYYY-MM-DD") 
    : dayjs().subtract(90, "day").format("YYYY-MM-DD");        
  return { date_start: start, date_end: end };
}

async function withLock(module, fn) {
  let cur = await SyncCursor.findOne({ module });
  if (!cur) cur = await SyncCursor.create({ module });
  if (cur.running) throw new Error(`${module} sync already running`);

  cur.running = true;
  cur.lastError = undefined;
  await cur.save();

  try {
    const res = await fn(cur);
    cur.lastSyncAt = new Date();
    return res;
  } catch (e) {
    cur.lastError = e?.message || String(e);
    throw e;
  } finally {
    cur.running = false;
    await cur.save();
  }
}

export async function nightlyInvoices() {
  return withLock("invoices", async (cursor) => {
    const params = FULL_REFRESH_NIGHTLY ? {} : getDeltaParams(cursor.lastSyncAt);
    const { items } = await fetchAllZohoPages("/invoices", params, "invoices");
    const r = await bulkUpsertInvoices(items);
    return { module: "invoices", mode: FULL_REFRESH_NIGHTLY ? "full" : "delta", fetched: items.length, ...r };
  });
}

export async function nightlyPOs() {
  return withLock("purchaseorders", async (cursor) => {
    const params = FULL_REFRESH_NIGHTLY ? {} : getDeltaParams(cursor.lastSyncAt);
    const { items } = await fetchAllZohoPages("/purchaseorders", params, "purchaseorders");
    const r = await bulkUpsertPOs(items);
    return { module: "purchaseorders", mode: FULL_REFRESH_NIGHTLY ? "full" : "delta", fetched: items.length, ...r };
  });
}

export async function runNightlyBooksSync() {
  const a = await nightlyInvoices();
  const b = await nightlyPOs();
  return { invoices: a, purchaseorders: b };
}
