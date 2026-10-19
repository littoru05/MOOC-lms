import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { setAccessToken } from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user_cache');
  }, []);

  // Khởi tạo phiên xác thực khi ứng dụng mount (F5) bằng cơ chế Silent Refresh qua HttpOnly Cookie
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const res = await authApi.refreshToken();
        if (!isMounted) return;

        const { token: newAccessToken, ...userData } = res.data;
        setAccessToken(newAccessToken);
        setToken(newAccessToken);
        setUser(userData);
      } catch (err) {
        // Chưa đăng nhập hoặc cookie hết hạn (bình thường đối với khách vãng lai)
        if (!isMounted) return;
        clearAuth();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [clearAuth]);

  // Đồng bộ React state khi Axios interceptor ngầm refresh token thành công
  useEffect(() => {
    const handleAuthRefreshed = (event) => {
      const newToken = event.detail?.token;
      const newUserData = event.detail?.user;
      if (newToken) {
        setToken(newToken);
      }
      if (newUserData) {
        const { token: _, ...userData } = newUserData;
        setUser((prev) => ({ ...prev, ...userData }));
      }
    };

    window.addEventListener('auth:refreshed', handleAuthRefreshed);
    return () => window.removeEventListener('auth:refreshed', handleAuthRefreshed);
  }, []);

  // Lắng nghe sự kiện hết hạn phiên toàn cục (từ Axios interceptors)
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
    setAccessToken(newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (registerData) => {
    const res = await authApi.register(registerData);
    const { token: newToken, ...userData } = res.data;
    setAccessToken(newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Lỗi khi gọi API logout backend:', err);
    } finally {
      clearAuth();
      showToast?.('Đã đăng xuất khỏi tài khoản thành công.', 'info');
    }
  };

  const updateProfile = async (profileData) => {
    const res = await authApi.updateProfile(profileData);
    const updatedUser = res.data;
    setUser(updatedUser);
    return updatedUser;
  };

  const changePassword = async (passData) => {
    const res = await authApi.changePassword(passData);
    return res.data;
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
        updateProfile,
        changePassword,
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

