import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure axios defaults
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }

  // Register user
  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/users/register', formData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      setLoading(false);
      return false;
    }
  };

  // Login user
  const login = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/users/login', formData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  // Telegram login
  const telegramLogin = async (telegramId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/users/login', { telegramId });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Telegram login failed');
      setLoading(false);
      return false;
    }
  };

  // Load user data
  const loadUser = async () => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      try {
        const res = await axios.get('/api/users/profile');
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
        setError(err.response?.data?.msg || 'Authentication failed');
      }
    }
    setLoading(false);
  };

  // Check auth status
  const checkAuthStatus = useCallback(async () => {
    await loadUser();
  }, []);

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
    delete axios.defaults.headers.common['x-auth-token'];
  };

  // Update user profile
  const updateProfile = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.put('/api/users/profile', formData);
      setUser(res.data);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Update failed');
      setLoading(false);
      return false;
    }
  };

  // Clear errors
  const clearErrors = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        telegramLogin,
        logout,
        loadUser,
        checkAuthStatus,
        updateProfile,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
