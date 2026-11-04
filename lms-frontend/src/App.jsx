import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { queryClient } from './lib/queryClient';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AppRoutes } from './routes/AppRoutes';

function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthExpired = (event) => {
      const message = event.detail?.message || 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.';
      navigate('/login', { replace: true, state: { expired: true, message } });
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <ScrollToTop />
          <AuthListener />
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
