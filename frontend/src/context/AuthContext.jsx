import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

const extractErrorMessage = (err, fallback) => {
  if (!err) return fallback;
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => (d?.msg ? String(d.msg).replace('Value error, ', '') : JSON.stringify(d))).join('. ');
  }
  if (detail && typeof detail === 'object') {
    return detail.msg || detail.message || JSON.stringify(detail);
  }
  return err.message || fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tastecraft_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('tastecraft_token'));
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('tastecraft_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (credentialsOrIdentifier, maybePassword) => {
    try {
      let payload = {};
      if (typeof credentialsOrIdentifier === 'object' && credentialsOrIdentifier !== null) {
        payload = credentialsOrIdentifier;
      } else {
        payload = {
          email_or_username: credentialsOrIdentifier,
          password: maybePassword,
        };
      }

      const res = await api.post('/auth/login', payload);
      const { access_token, user: userData } = res.data;
      
      localStorage.setItem('tastecraft_token', access_token);
      localStorage.setItem('tastecraft_user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      showSuccess(`Welcome back, ${userData.full_name || userData.username}!`);
      return userData;
    } catch (err) {
      const message = extractErrorMessage(err, 'Failed to sign in. Please check your credentials and try again.');
      showError(message);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { access_token, user: newUser } = res.data;
      
      localStorage.setItem('tastecraft_token', access_token);
      localStorage.setItem('tastecraft_user', JSON.stringify(newUser));
      
      setToken(access_token);
      setUser(newUser);
      showSuccess('Account created successfully! Welcome to TasteCraft.');
      return newUser;
    } catch (err) {
      const message = extractErrorMessage(err, 'Registration failed. Please check the email and input fields.');
      showError(message);
      throw err;
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const res = await api.put('/auth/me', updateData);
      setUser(res.data);
      localStorage.setItem('tastecraft_user', JSON.stringify(res.data));
      showSuccess('Profile updated successfully!');
      return res.data;
    } catch (err) {
      const message = extractErrorMessage(err, 'Failed to update profile.');
      showError(message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('tastecraft_token');
    localStorage.removeItem('tastecraft_user');
    setToken(null);
    setUser(null);
    showSuccess('Signed out successfully.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
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
