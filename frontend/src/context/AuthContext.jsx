import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const mergeGuestData = async () => {
    try {
      // Merge guest cart
      const guestCart = JSON.parse(localStorage.getItem('pc_cart') || '[]');
      if (guestCart.length > 0) {
        const items = guestCart.map((item) => ({
          productId: item.id,
          quantity: item.qty,
        }));
        await api.post('/cart', { items });
        localStorage.removeItem('pc_cart');
      }

      // Merge guest favorites
      const guestFavorites = JSON.parse(localStorage.getItem('pc_favorites') || '[]');
      if (guestFavorites.length > 0) {
        await api.post('/favorites', { productIds: guestFavorites });
        localStorage.removeItem('pc_favorites');
      }
    } catch (error) {
      console.error('Error merging guest data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
        mergeGuestData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

