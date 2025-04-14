import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '../features/auth/auth.js';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/auth' || 
        location.pathname === '/auth/complete' || 
        location.pathname.startsWith('/oauth/complete')) {
      setLoading(false);
      return;
    }
    
    checkAuth();
  }, [location.pathname]);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/user`, {
        withCredentials: true
      });
      
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setIsAuthenticated(false);
        setUser(null);
        window.location.href = '/auth';
        return;
      }
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const success = await auth.login(credentials);
      if (success) {
        await checkAuth();
      }
      return success;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
    setUser,
    setIsAuthenticated
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 