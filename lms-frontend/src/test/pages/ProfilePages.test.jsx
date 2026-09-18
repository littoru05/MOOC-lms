import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { StudentProfilePage } from '../../pages/student/StudentProfilePage';
import { InstructorProfilePage } from '../../pages/instructor/InstructorProfilePage';
import { AdminProfilePage } from '../../pages/admin/AdminProfilePage';

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('Profile Pages Tests', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem(
      'user_cache',
      JSON.stringify({
        id: 3,
        email: 'student@lms.com',
        fullName: 'Trần Văn Học Viên',
        role: 'ROLE_STUDENT',
        phone: '0987654321',
        dateOfBirth: '2001-05-15',
        gender: 'Nam',
      })
    );
  });

  it('renders StudentProfilePage and submits profile update', async () => {
    renderWithProviders(<StudentProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Trần Văn Học Viên')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Trần Văn Học Viên');
    fireEvent.change(nameInput, { target: { value: 'Trần Văn Học Viên Mới' } });

    const saveButton = screen.getByRole('button', { name: /lưu thay đổi/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Trần Văn Học Viên Mới')).toBeInTheDocument();
    });
  });

  it('renders InstructorProfilePage and displays initial values', async () => {
    renderWithProviders(<InstructorProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /hồ sơ giảng viên/i })).toBeInTheDocument();
    });
  });

  it('renders AdminProfilePage and displays initial values', async () => {
    renderWithProviders(<AdminProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /hồ sơ quản trị viên/i })).toBeInTheDocument();
    });
  });
});
