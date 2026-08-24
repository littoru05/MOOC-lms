import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { AppRoutes } from '../../routes/AppRoutes';

const renderAppAt = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
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

  it('luồng đăng nhập học viên thành công và điều hướng vào /my-learning', async () => {
    const user = userEvent.setup();
    renderAppAt('/login');

    const emailInput = screen.getByPlaceholderText('student@lms.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập$/i });

    await user.type(emailInput, 'student@lms.com');
    await user.type(passwordInput, 'student123');
    await user.click(submitBtn);

    // Sau khi đăng nhập thành công, điều hướng vào /my-learning
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Khóa học đã ghi danh của tôi/i })).toBeInTheDocument();
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
});
