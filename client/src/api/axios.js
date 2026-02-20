import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
