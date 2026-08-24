import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthModal } from '../../components/auth/AuthModal';

export const LoginPage = ({ initialMode = 'LOGIN' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const from = location.state?.from?.pathname || '/';

  const handleAuthSuccess = (targetRole) => {
    setIsOpen(false);
    const targetPath = location.state?.from?.pathname;

    if (targetPath && targetPath !== '/' && targetPath !== '/login' && targetPath !== '/register') {
      navigate(targetPath, { replace: true });
      return;
    }

    if (targetRole === 'ROLE_INSTRUCTOR' || targetRole === 'INSTRUCTOR') {
      navigate('/instructor/dashboard', { replace: true });
    } else if (targetRole === 'ROLE_ADMIN' || targetRole === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/my-learning', { replace: true });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] flex items-center justify-center p-4">
      <AuthModal
        isOpen={isOpen}
        initialMode={initialMode}
        onClose={handleClose}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default LoginPage;
