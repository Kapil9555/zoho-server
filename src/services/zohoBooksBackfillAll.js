import { bulkUpsertInvoices, bulkUpsertPOs } from "./upsertBooks.js";
import { fetchAllZohoPages } from "./zohoHelpers.js";

export async function backfillAllInvoices() {
  const { items } = await fetchAllZohoPages("/invoices", {}, "invoices");
  const r = await bulkUpsertInvoices(items);
  return { module: "invoices", totalFetched: items.length, ...r };
}

export async function backfillAllPOs() {
  const { items } = await fetchAllZohoPages("/purchaseorders", {}, "purchaseorders");
  const r = await bulkUpsertPOs(items);
  return { module: "purchaseorders", totalFetched: items.length, ...r };
}

export async function backfillAll() {
  const a = await backfillAllInvoices();
  const b = await backfillAllPOs();
  return { invoices: a, purchaseorders: b };
}
