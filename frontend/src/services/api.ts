
import axios from 'axios';

// API base URL'yi tanımlayalım - localhost:3000 için
const API_URL = 'http://localhost:3000/api';

// Axios instance oluşturalım
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - auth token eklemek için
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clinicToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata kontrolü için
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Token geçersiz olduğunda otomatik logout
    if (response && response.status === 401) {
      localStorage.removeItem('clinicToken');
      localStorage.removeItem('clinicUser');
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export default api;
