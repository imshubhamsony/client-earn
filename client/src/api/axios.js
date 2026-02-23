import axios from 'axios';

// When deployed separately (static site), set VITE_API_URL to your API origin (e.g. https://yourapp-api.onrender.com)
const apiBase = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api';

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const getDeviceId = () => {
  let id = localStorage.getItem('earntask_device_id');
  if (!id) {
    id = 'web_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('earntask_device_id', id);
  }
  return id;
};

api.interceptors.request.use((config) => {
  config.headers['X-Device-ID'] = getDeviceId();
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('earntask_user');
      window.dispatchEvent(new Event('earntask_unauth'));
    }
    return Promise.reject(err);
  }
);

export default api;
