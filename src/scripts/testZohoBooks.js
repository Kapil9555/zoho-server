// scripts/testZohoBooks.mjs
import 'dotenv/config';
import api from '../services/zohoApi.js';

try {
  // Simple Books endpoint
  const r = await api.get('/organizations');
  console.log('Status:', r.status);
  console.log('Organizations:', Array.isArray(r.data?.organizations) ? r.data.organizations.length : 'n/a');
} catch (e) {
  console.error('Error:', e.response?.status, e.response?.data || e.message);
}
