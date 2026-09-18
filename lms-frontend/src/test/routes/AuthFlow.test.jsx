import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { AppRoutes } from '../../routes/AppRoutes';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

const renderAppAt = (initialRoute = '/') => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('End-to-End User Auth & Navigation Flow', () => {
  it('chuyển hướng người dùng chưa đăng nhập từ trang được bảo vệ /my-learning về /login', async () => {
    renderAppAt('/my-learning');

    // Chờ component LoginPage hiển thị
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Chào mừng bạn trở lại/i })).toBeInTheDocument();
    });
  });

  it('luồng đăng nhập học viên thành công và điều hướng vào trang chủ /', async () => {
    const user = userEvent.setup();
    renderAppAt('/login');

    const emailInput = screen.getByPlaceholderText('student@lms.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập$/i });

    await user.type(emailInput, 'student@lms.com');
    await user.type(passwordInput, 'student123');
    await user.click(submitBtn);

    // Sau khi đăng nhập thành công, học viên điều hướng vào trang chủ /
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Khám phá tri thức, làm chủ công nghệ tương lai/i })).toBeInTheDocument();
    });
  });

  it('luồng đăng nhập giảng viên thành công và điều hướng thẳng vào Studio /instructor/dashboard', async () => {
    const user = userEvent.setup();
    renderAppAt('/login');

    const emailInput = screen.getByPlaceholderText('student@lms.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập$/i });

    await user.type(emailInput, 'instructor@lms.com');
    await user.type(passwordInput, 'instructor123');
    await user.click(submitBtn);

    // Sau khi đăng nhập thành công, điều hướng vào Studio Giảng viên
    await waitFor(() => {
      expect(screen.getAllByText(/EduMOOC Studio/i)[0]).toBeInTheDocument();
    });
  });

  it('luồng đăng nhập quản trị viên thành công và điều hướng thẳng vào /admin/dashboard', async () => {
    const user = userEvent.setup();
    renderAppAt('/login');

    const emailInput = screen.getByPlaceholderText('student@lms.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập$/i });

    await user.type(emailInput, 'admin@lms.com');
    await user.type(passwordInput, 'admin123');
    await user.click(submitBtn);

    // Sau khi đăng nhập thành công, điều hướng vào Quản trị Admin
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Tổng quan Hệ sinh thái EduMOOC/i })).toBeInTheDocument();
    });
  });
});
