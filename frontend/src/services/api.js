import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// No need for token interceptors with session auth
// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      window.location.href = '/auth';
    }

    return Promise.reject(error);
  }
);

export const auth = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
};

export const artwork = {
  create: (data) => api.post('/artwork/create', data),
  update: (id, data) => api.put(`/artwork/${id}/update`, data),
  getAll: () => api.get('/gallery'),
  getOne: (id) => api.get(`/artwork/${id}`),
  
  // add artwork like/unlike
  checkIfLiked: (id) => api.get(`/artwork/${id}/check_if_liked/`),
  like: (id) => api.post(`/artwork/${id}/like/`),
};

export const profile = {
  get: (username) => api.get(`/profile/${username}`),
  update: (data) => api.post('/profile/setup', data),
  getPhoto: (username) => api.get(`/profile/${username}/photo`),
};

export default api; 