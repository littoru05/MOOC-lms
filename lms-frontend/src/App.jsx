import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes/AppRoutes';

function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthExpired = () => {
      navigate('/login');
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AuthListener />
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}
