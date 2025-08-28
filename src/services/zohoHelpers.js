import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


const ZOHO_BASE_URL = process.env.ZOHO_BASE_URL || "https://www.zohoapis.in/books/v3";

const ZOHO_ORG_ID   = process.env.ZOHO_ORG_ID;
const ZOHO_TOKEN    = process.env.ZOHO_REFRESH_TOKEN;


if (!ZOHO_ORG_ID || !ZOHO_TOKEN) {
  console.warn("Missing ZOHO_ORG_ID or ZOHO_REFRESH_TOKEN in .env");
}

import api from "./zohoApi.js";

// export async function zohoGet(path, params = {}) {
//   const url = `${ZOHO_BASE_URL}${path}`;

//   // console.log(`Fetching Zoho data from: ${url} with params:`, params);
//   // console.log(`Using Organization ID: ${ZOHO_ORG_ID}`);
//   // console.log(`Using Access Token: ${ZOHO_TOKEN}`);

//   try {
//     const res = await axios.get(url, {
//       headers: {
//         Authorization: `Zoho-oauthtoken ${ZOHO_TOKEN}`,
//         "X-com-zoho-books-organizationid": ZOHO_ORG_ID
//       },
//       params
//     });
//     return res.data;
//   } catch (err) {
//     console.error(`Zoho GET ${path} failed:`, err?.response?.data || err.message);
//     throw err;
//   }
// }

export async function zohoGet(path, params = {}) {
  try {
    const res = await api.get(path, { params });
    return res.data;
  } catch (err) {
    console.error(`Zoho GET ${path} failed:`, err?.response?.data || err.message);
    throw err;
  }
}


export async function fetchAllZohoPages(path, baseParams = {}, itemKey) {
  const per_page = 200;
  let page = 1;
  let all = [];
  let lastContext = null;

  while (true) {
    const data = await zohoGet(path, { ...baseParams, page, per_page });
    const items = data?.[itemKey] || [];
    all = all.concat(items);
    lastContext = data?.page_context || null;

    if (!lastContext?.has_more_page) break;
    page += 1;
  }
  return { items: all, page_context: lastContext };
}
