// src/services/zoho/tokenManager.js
import 'dotenv/config';
import axios from 'axios';

const SKEW_MS = 60_000; 

let accessToken = null;
let expiryTs = 0;
let inflight = null;

function isExpiring() {
  return !accessToken || Date.now() + SKEW_MS >= expiryTs;
}

export async function refreshAccessToken() {
  if (inflight) return inflight; // de-dupe concurrent refresh

  inflight = (async () => {
    const accountsBase = process.env.ZOHO_ACCOUNTS_BASE_URL || 'https://accounts.zoho.in';
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    });

    const { data } = await axios.post(`${accountsBase}/oauth/v2/token`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // Zoho returns access_token, expires_in (seconds), token_type, api_domain (sometimes)
    accessToken = data.access_token;
    const expiresInMs = Number(data.expires_in || 3600) * 1000;
    expiryTs = Date.now() + expiresInMs;

    // If you want to follow api_domain dynamically, you could:
    // if (data.api_domain) { /* update axios baseURL in zohoApi.js via a setter */ }

    return accessToken;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export async function getAccessToken() {
  if (isExpiring()) {
    await refreshAccessToken();
  }
  return accessToken;
}
