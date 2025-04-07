import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getArtworks = () => api.get('/artworks/');
export const uploadArtwork = (data) => api.post('/artworks/', data);
export const login = (credentials) => api.post('/login/', credentials);
export const register = (userData) => api.post('/register/', userData);
export const getProfile = () => api.get('/profile/'); 