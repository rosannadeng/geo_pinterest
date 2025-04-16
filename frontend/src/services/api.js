import axios from 'axios';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const csrfToken = Cookies.get('csrftoken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  error => {
    if (error.response) {
      if (error.response.status === 403) {
        message.warning('Please login first');
        window.location.href = '/auth';
        return Promise.reject(error);
      }
      
      if (error.response.data && error.response.data.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Operation failed, please try again');
      }
    } else {
        message.error('Network error, please check your network connection');
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (credentials) => api.post('/api/login', credentials),
  register: (userData) => api.post('/api/register', userData),
  logout: () => api.post('/api/logout'),
  getUser: () => api.get('/api/user'),
  getGoogleAuthUrl: () => `${API_URL}/api/oauth/login/google-oauth2/`,
};

export const artwork = {
  create: (data) => api.post('/api/artwork/create', data),
  update: (id, data) => api.put(`/api/artwork/${id}/update`, data),
  getAll: () => api.get('/api/gallery'),
  getOne: (id) => api.get(`/api/artwork/${id}`),
  
  // add artwork like/unlike
  checkIfLiked: (id) => api.get(`/api/artwork/${id}/check_if_liked`),
  like: (id) => api.post(`/api/artwork/${id}/like`),

  // add comment related APIs
  getComments: (id) => api.get(`/api/artwork/${id}/comments`),
  addComment: (id, data) => api.post(`/api/artwork/${id}/comments/add`, data),
};

export const profile = {
  get: (username) => api.get(`/api/profile/${username}`),
  update: (data) => api.post('/api/profile/setup', data),
  getPhoto: (username) => api.get(`/api/profile/${username}/photo`),
};

export default api; 