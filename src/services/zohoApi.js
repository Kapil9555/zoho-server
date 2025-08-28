// src/services/zoho/zohoApi.js
import 'dotenv/config';
import axios from 'axios';
import { getAccessToken, refreshAccessToken } from './tokenManager.js';

const API_BASE = process.env.ZOHO_BOOKS_BASE_URL || process.env.ZOHO_BASE_URL || 'https://www.zohoapis.in/books/v3';

const ORG_ID = process.env.ZOHO_ORG_ID;

const api = axios.create({
  baseURL: API_BASE, // e.g., https://www.zohoapis.in/books/v3
  timeout: 20000,
});

// Add token + org header before each request
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  config.headers.Authorization = `Zoho-oauthtoken ${token}`; 
  if (ORG_ID) {
    config.headers['X-com-zoho-books-organizationid'] = ORG_ID;
  }
  return config;
});

// On 401, refresh token once and retry
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original.__retried) {
      original.__retried = true;
      await refreshAccessToken();
      const newToken = await getAccessToken();
      original.headers.Authorization = `Zoho-oauthtoken ${newToken}`;
      return api(original);
    }
    throw error;
  }
);

export default api;
