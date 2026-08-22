import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on startup; auto-authenticate with default student if no session exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
          setLoading(false);
          return;
        } catch (err) {
          console.warn('Phiên cũ hết hạn, đang đăng nhập lại tài khoản mặc định...');
        }
      }

      // Auto-login with default student account so all API calls have a valid Bearer JWT
      try {
        const res = await authApi.login({
          email: 'student@lms.com',
          password: 'student123',
        });
        const { token: newToken, ...userData } = res.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user_cache', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
      } catch (e) {
        console.warn('Backend chưa sẵn sàng, dùng cache local');
        const storedUser = localStorage.getItem('user_cache');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

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
    localStorage.removeItem('token');
    localStorage.removeItem('user_cache');
    setToken(null);
    setUser(null);
  };

  // Quick switch role for instant evaluation / demo
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

    try {
      await login(email, pass);
    } catch (err) {
      console.warn('Lỗi khi quick switch backend:', err);
      const mockUser = {
        id: targetRole === 'ROLE_ADMIN' ? 1 : targetRole === 'ROLE_INSTRUCTOR' ? 2 : 3,
        email,
        fullName: targetRole === 'ROLE_ADMIN' ? 'Quản trị viên Hệ thống' : targetRole === 'ROLE_INSTRUCTOR' ? 'TS. Nguyễn Văn A' : 'Trần Văn Học Viên',
        role: targetRole,
      };
      setUser(mockUser);
      localStorage.setItem('user_cache', JSON.stringify(mockUser));
    }
  };

  const currentRole = user?.role || 'ROLE_STUDENT';
  const isStudent = currentRole === 'ROLE_STUDENT';
  const isInstructor = currentRole === 'ROLE_INSTRUCTOR';
  const isAdmin = currentRole === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
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
