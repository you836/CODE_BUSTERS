import axios from 'axios';

let rawBaseUrl = (import.meta.env.VITE_API_URL || '/api').trim();
// Strip trailing slashes
rawBaseUrl = rawBaseUrl.replace(/\/+$/, '');

// If the user provided a full domain without /api (e.g. https://life-rpg-hivv.onrender.com), normalize it
if (rawBaseUrl.startsWith('http') && !rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = `${rawBaseUrl}/api`;
}

const api = axios.create({
  baseURL: rawBaseUrl,
});

// Request Interceptor: Attach JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('life_rpg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and synchronize auth store
      localStorage.removeItem('life_rpg_token');
      localStorage.removeItem('life_rpg_user');
      window.dispatchEvent(new CustomEvent('life_rpg_unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
