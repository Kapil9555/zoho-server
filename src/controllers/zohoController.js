import axios from 'axios';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
dotenv.config();



// Load from environment variables
const ZOHO_BASE_URL = process.env.ZOHO_BOOKS_BASE_URL || 'https://www.zohoapis.in/books/v3';
const ZOHO_ORG_ID = process.env.ZOHO_ORG_ID;
const ZOHO_AUTH_TOKEN = process.env.ZOHO_ACCESS_TOKEN;

// console.log('Zoho Books API initialized with base URL:', ZOHO_BASE_URL);
// console.log('Zoho Books Organization ID:', ZOHO_ORG_ID);
// console.log('Zoho Books Auth Token:', ZOHO_AUTH_TOKEN)


if (!ZOHO_ORG_ID || !ZOHO_AUTH_TOKEN) {
  console.warn('⚠️ Missing Zoho Books credentials in environment variables');
}


/**
 * GET request to Zoho Books API
*/


const zohoGet = async (path, params = {}) => {
  try {
    const url = `${ZOHO_BASE_URL}${path}`;

    console.log("url",url)
    // console.log("pathpathpath",path)

    const res = await axios.get(url, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${ZOHO_AUTH_TOKEN}`,
        'X-com-zoho-books-organizationid': ZOHO_ORG_ID,
      },
      params,
    });
    console.log(`Zoho GET ${path}`, { params });
    return res.data;
  } catch (error) {
    console.error(`❌ Zoho GET error at ${path}:`, error?.response?.data || error.message);
    throw error;
  }
};

// Controllers
export const getInvoices = async (req, res) => {
  try {
    const data = await zohoGet('/invoices', req.query);
    res.json({
      invoices: data?.invoices || [],
      page_context: data?.page_context || null,
      raw: data,
    });
  } catch (err) {
    console.error('getInvoices error:', err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({
      message: err?.response?.data?.message || err.message || 'Failed to fetch invoices',
    });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await zohoGet(`/invoices/${id}`, req.query);
    res.json({ invoice: data?.invoice || data });
  } catch (err) {
    console.error('getInvoiceById error:', err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({
      message: err?.response?.data?.message || err.message || 'Failed to fetch invoice',
    });
  }
};

export const getPurchaseOrders = async (req, res) => {
  try {
    const data = await zohoGet('/purchaseorders', req.query);
    res.json({
      purchaseorders: data?.purchaseorders || [],
      page_context: data?.page_context || null,
      raw: data,
    });
  } catch (err) {
    console.error('getPurchaseOrders error:', err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({
      message: err?.response?.data?.message || err.message || 'Failed to fetch purchase orders',
    });
  }
};


export const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await zohoGet(`/purchaseorders/${id}`, req.query);
    res.json({ purchaseorder: data?.purchaseorder || data });
  } catch (err) {
    console.error('getPurchaseOrderById error:', err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({
      message: err?.response?.data?.message || err.message || 'Failed to fetch purchase order',
    });
  }
};

export const getPurchaseOrdersByRef = async (req, res) => {
  try {
    const { id } = req.query;

    // console.log('getPurchaseOrdersByRef called with ID:', req.params);

    if (!id) {
      return res.status(400).json({ message: "Purchase Order ID is required" });
    }

    const response = await axios.get(`${ZOHO_BASE_URL}/purchaseorders/${id}`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${ZOHO_AUTH_TOKEN}`,
        "X-com-zoho-books-organizationid": ZOHO_ORG_ID,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error("❌ getPurchaseOrderById error:", err?.response?.data || err.message);
    res
      .status(err?.response?.status || 500)
      .json({ message: err?.response?.data?.message || "Failed to fetch PO by ID" });
  }
};

export const getBills = async (req, res) => {
  try {
    const data = await zohoGet('/bills', req.query);
    res.json({
      bills: data?.bills || [],
      page_context: data?.page_context || null,
      raw: data,
    });
  } catch (err) {
    console.error('getBills error:', err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({
      message: err?.response?.data?.message || err.message || 'Failed to fetch bills',
    });
  }
};

export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await zohoGet(`/bills/${id}`, req.query);
    res.json({ bill: data?.bill || data });
  } catch (err) {
    console.error('getBillById error:', err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({
      message: err?.response?.data?.message || err.message || 'Failed to fetch bill',
    });
  }
};

// Controller for GET /api/invoices
















const DASHBOARD_TARGET = Number(process.env.DASHBOARD_TARGET || 1000000);

/**
 * Utility: iterate all pages for a Zoho list endpoint
 */


async function fetchAllZohoPages(path, baseParams = {}, itemKey) {
  const per_page = 200; // Zoho max page size
  let page = 1;
  let all = [];
  let lastContext = null;

  while (true) {
    const data = await zohoGet(path, { ...baseParams, page, per_page });
    const items = data?.[itemKey] || [];
    all = all.concat(items);
    lastContext = data?.page_context || null;

    const hasMore = lastContext?.has_more_page;
    if (!hasMore) break;
    page += 1;
  }
  return { items: all, page_context: lastContext };
}

/**
 * Map minimal fields for table rendering
 */
function mapInvoiceRow(inv) {
  return {
    invoice_id: inv.invoice_id,
    invoice_number: inv.invoice_number,
    customer_name: inv.customer_name,
    date: inv.date, // YYYY-MM-DD
    status: inv.status, // e.g., paid, sent, draft
    total: inv.total,
    balance: inv.balance,
    currency_code: inv.currency_code,
  };
}

function mapPoRow(po) {
  return {
    purchaseorder_id: po.purchaseorder_id,
    purchaseorder_number: po.purchaseorder_number,
    vendor_name: po.vendor_name,
    date: po.date, // YYYY-MM-DD
    status: po.status,
    total: po.total,
    currency_code: po.currency_code,
  };
}

/**
 * Group invoices by YYYY-MM and sum billed + realized
 */


function groupMonthly(invoices) {
  const buckets = {};
  for (const inv of invoices) {
    if (!inv?.date) continue;
    const month = dayjs(inv.date).format('YYYY-MM');
    const billed = Number(inv.total || 0);
    const realized = Math.max(0, Number(inv.total || 0) - Number(inv.balance || 0));
    if (!buckets[month]) buckets[month] = { month, billed: 0, realized: 0 };
    buckets[month].billed += billed;
    buckets[month].realized += realized;
  }
  return Object.values(buckets).sort((a, b) => (a.month < b.month ? -1 : 1));
}



/**
 * GET /api/zoho/dashboard
 * Aggregates revenue, target, monthly series, and returns paged tables for invoices/POs
 */


export const getDashboard = async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      target,
      metric = 'realized',
      inv_page = 1,
      inv_per_page = 25,
      po_page = 1,
      po_per_page = 25,
    } = req.query;


    // Default date range: current FY (Apr 1 -> Mar 31 for India)
    const today = dayjs();

    const fyStart = today.month() >= 3
      ? dayjs(`${today.year()}-04-01`)
      : dayjs(`${today.year() - 1}-04-01`);
    const fyEnd = fyStart.add(1, 'year').subtract(1, 'day');

    const dateStart = start_date ? dayjs(start_date) : fyStart;
    const dateEnd = end_date ? dayjs(end_date) : fyEnd;

    const date_start = dateStart.format('YYYY-MM-DD');
    const date_end = dateEnd.format('YYYY-MM-DD');


    // FIX: No invalid filter_by here
    const listParams = { date_start, date_end };

    // 1) Pull ALL invoices in range to compute totals & monthly series
    const { items: allInvoices } = await fetchAllZohoPages('/invoices', listParams, 'invoices');

    // Compute totals
    let billedTotal = 0;
    let realizedTotal = 0;

    for (const inv of allInvoices) {
      const total = Number(inv.total || 0);
      const balance = Number(inv.balance || 0);
      billedTotal += total;
      realizedTotal += Math.max(0, total - balance);
    }

    // Monthly buckets
    const monthly = groupMonthly(allInvoices);

    // Target & status
    const targetNumber = Number((target ?? DASHBOARD_TARGET) || 0);
    const trackedTotal = metric === 'billed' ? billedTotal : realizedTotal;
    const targetProgressPct = targetNumber > 0 ? +(trackedTotal / targetNumber * 100).toFixed(2) : null;
    const targetAchieved = targetNumber > 0 ? trackedTotal >= targetNumber : null;

    
    // 2) Paged invoices (for table)
    const invPaged = await zohoGet('/invoices', {
      ...listParams,
      page: Number(inv_page) || 1,
      per_page: Number(inv_per_page) || 25,
    });
    const invoiceRows = (invPaged?.invoices || []).map(mapInvoiceRow);

    // 3) Paged POs (for table)
    const poPaged = await zohoGet('/purchaseorders', {
      ...listParams,
      page: Number(po_page) || 1,
      per_page: Number(po_per_page) || 25,
    });
    const poRows = (poPaged?.purchaseorders || []).map(mapPoRow);

    // Response
    res.json({
      range: { start_date: date_start, end_date: date_end },
      totals: {
        billed: billedTotal,
        realized: realizedTotal,
        metric,
        target: targetNumber || null,
        targetAchieved,
        targetProgressPct,
      },
      monthlyRevenue: monthly.map((m) => ({
        month: m.month,
        billed: +m.billed.toFixed(2),
        realized: +m.realized.toFixed(2),
        value: metric === 'billed' ? +m.billed.toFixed(2) : +m.realized.toFixed(2),
      })),
      invoices: {
        items: invoiceRows,
        page_context: invPaged?.page_context || null,
      },
      purchaseOrders: {
        items: poRows,
        page_context: poPaged?.page_context || null,
      },
    });
  } catch (err) {
    console.error('getDashboard error:', err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({
      message: err?.response?.data?.message || err.message || 'Failed to build dashboard',
    });
  }
};