/**
 * api.js — Centralized API base URL helper
 *
 * In development: VITE_API_BASE is empty → Vite proxy sends /api/* to localhost:5000
 * In production:  VITE_API_BASE = "https://YOUR-USERNAME-ytmusic-backend.hf.space"
 *                 → All /api/* calls go directly to HuggingFace Spaces backend
 */
const BASE = import.meta.env.VITE_API_BASE || '';

export const api = {
  search:  (q)        => `${BASE}/api/search?q=${encodeURIComponent(q)}`,
  stream:  (id, qual) => `${BASE}/api/stream/${id}?quality=${qual || 'high'}`,
  lyrics:  (id)       => `${BASE}/api/lyrics/${id}`,
  related: (id)       => `${BASE}/api/related/${id}`,
};
