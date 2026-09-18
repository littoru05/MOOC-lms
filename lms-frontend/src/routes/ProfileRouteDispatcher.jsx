import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';

export const ProfileRouteDispatcher = () => {
  const { user, isInstructor, isAdmin } = useAuth();

  const role = user?.role;
  if (isInstructor || role === 'ROLE_INSTRUCTOR' || role === 'INSTRUCTOR') {
    return <Navigate to="/instructor/profile" replace />;
  }

  if (isAdmin || role === 'ROLE_ADMIN' || role === 'ADMIN') {
    return <Navigate to="/admin/profile" replace />;
  }

  return <StudentProfilePage />;
};
