import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_cache');
    setToken(null);
    setUser(null);
  }, []);

  // Load user profile on startup if token exists; clear and notify if expired
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
          setToken(storedToken);
        } catch (err) {
          console.warn('Phiên đăng nhập đã hết hạn hoặc không hợp lệ:', err);
          clearAuth();
          showToast?.('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.', 'error');
          window.dispatchEvent(
            new CustomEvent('auth:expired', {
              detail: { message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' },
            })
          );
        }
      } else {
        clearAuth();
      }
      setLoading(false);
    };

    initAuth();
  }, [clearAuth, showToast]);

  // Listen for global auth expiration events (e.g. from Axios interceptors)
  useEffect(() => {
    const handleAuthExpired = (event) => {
      clearAuth();
      const message = event.detail?.message || 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.';
      showToast?.(message, 'error');
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [clearAuth, showToast]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user_cache', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (registerData) => {
    const res = await authApi.register(registerData);
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user_cache', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    clearAuth();
    showToast?.('Đã đăng xuất khỏi tài khoản thành công.', 'info');
  };

  // Quick switch role for testing with legitimate backend credentials
  const quickSwitchRole = async (targetRole) => {
    let email = 'student@lms.com';
    let pass = 'student123';
    if (targetRole === 'ROLE_INSTRUCTOR') {
      email = 'instructor@lms.com';
      pass = 'instructor123';
    } else if (targetRole === 'ROLE_ADMIN') {
      email = 'admin@lms.com';
      pass = 'admin123';
    }

    await login(email, pass);
  };

  const currentRole = user?.role || null;
  const isStudent = user?.role === 'ROLE_STUDENT';
  const isInstructor = user?.role === 'ROLE_INSTRUCTOR';
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        clearAuth,
        quickSwitchRole,
        currentRole,
        isStudent,
        isInstructor,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

