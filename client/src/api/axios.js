import axios from 'axios';

const api = axios.create({
  baseURL:  import.meta.env.VITE_API_URL || '/api',
})

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
