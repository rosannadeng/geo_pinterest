import axios from 'axios';
import Cookies from "js-cookie"; 

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const auth = {
  // Function to get CSRF token
  getCSRFToken: async () => {
    try {
      // Make a request to get a new CSRF token
      await axios.get(`${API_URL}/get_csrf_token`, { withCredentials: true });
      return Cookies.get("csrftoken");
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      return null;
    }
  },

  login: async (credentials) => {
    try {
      // Get fresh CSRF token before login
      const csrfToken = await auth.getCSRFToken();
      
      const response = await axios.post(`${API_URL}/login`, credentials, {
        withCredentials: true,
        headers: {
          "X-CSRFToken": csrfToken,
        }
      });
      if (response.data && response.data.user) {
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
      const csrfToken = await auth.getCSRFToken();
      const response = await axios.post(`${API_URL}/register`, userData, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true,
      });
      return response;
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new Error('Registration failed, please try again later');
    }
  },

  logout: async () => {
    try {
      const csrfToken = await auth.getCSRFToken();
      await axios.post(`${API_URL}/logout`, {}, {
        withCredentials: true,
        headers: {
          "X-CSRFToken": csrfToken,
        }
      });
      Cookies.remove("csrftoken");
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await axios.get(`${API_URL}/user`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // Google OAuth related methods
  getGoogleAuthUrl: () => {
    return `${API_URL}/oauth/login/google-oauth2/`;
  },
};

export default auth; 