import axios from 'axios';

// By default the app uses relative paths (/api, /uploads) — in dev via Vite's
// proxy, in production via Netlify's proxy (see netlify.toml). If you ever want
// the frontend to call the backend directly, set VITE_API_URL to the backend
// origin (e.g. https://venturly-api.onrender.com) at build time.
const API_ORIGIN = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${API_ORIGIN}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wf_token');
    }
    return Promise.reject(err);
  }
);

// Helper to turn a stored "/uploads/..." path into a usable URL.
// Returns the path as-is when using a proxy (relative), or prefixes the backend
// origin when VITE_API_URL is set.
export const mediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
};

export default api;
