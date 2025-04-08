import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  async (error) => {
    const originalRequest = error.config;

    // If it's a 401 error and not a refresh token request
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken
        });

        const { access } = response.data;
        localStorage.setItem('token', access);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers['Authorization'] = `Bearer ${access}`;

        return api(originalRequest);
      } catch (error) {
        // If refresh token fails, clear local storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const auth = {
  login: (credentials) => api.post('/token/', credentials),
  register: (userData) => api.post('/register/', userData),
  logout: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return api.post('/logout/', { refresh: refreshToken });
  },
  getUser: () => api.get('/user/'),
};

export const artwork = {
  create: (data) => api.post('/artwork/create/', data),
  update: (id, data) => api.put(`/artwork/${id}/update/`, data),
  getAll: () => api.get('/gallery/'),
  getOne: (id) => api.get(`/artwork/${id}/`),
};

export const profile = {
  get: (username) => api.get(`/profile/${username}/`),
  update: (data) => api.post('/profile/setup/', data),
  getPhoto: (username) => api.get(`/profile/${username}/photo/`),
};

export default api; 