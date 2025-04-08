import axios from 'axios';
import Cookies from "js-cookie"; 

const csrfToken = Cookies.get("csrftoken");
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const auth = {
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      if (response.data) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        const userResponse = await axios.get(`${API_URL}/user`, {
          headers: {
            Authorization: `Bearer ${response.data.access}`
          }
        });
        localStorage.setItem('user', JSON.stringify(userResponse.data));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true,
      });
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axios.post(`${API_URL}/logout`, { refresh: refreshToken });
      }
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // Google OAuth related methods
  getGoogleAuthUrl: () => {
    return `${API_URL}/oauth/login/google-oauth2`;
  },

  handleGoogleCallback: async (code) => {
    try {
      const response = await axios.get(`${API_URL}/oauth/complete/google-oauth2`, {
        params: { code }
      });
      if (response.data) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.redirect_url) {
          window.location.href = response.data.redirect_url;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  }
};

export default auth; 