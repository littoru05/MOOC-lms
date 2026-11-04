import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { LoginPage } from '../../pages/auth/LoginPage';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';

const renderLoginPageAt = (initialRoute = '/login', state = null) => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: initialRoute, state }]}>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage initialMode="login" />} />
            <Route path="/register" element={<LoginPage initialMode="register" />} />
            <Route path="/" element={<div>Trang Chủ Test</div>} />
            <Route path="/instructor/dashboard" element={<div>Studio Giảng Viên Test</div>} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
};

describe('LoginPage Redesign Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('1. Render layout 2 nửa: khung minh họa học tập và khung biểu mẫu đăng nhập', () => {
    renderLoginPageAt('/login');

    expect(screen.getByText('EduMOOC')).toBeInTheDocument();
    expect(screen.getByText(/Nền tảng Học trực tuyến/i)).toBeInTheDocument();
    expect(screen.getByText(/Học tập theo năng lực/i)).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /Chào mừng bạn trở lại/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('student@lms.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng nhập$/i })).toBeInTheDocument();
    expect(screen.getByText(/Quay về trang chủ/i)).toBeInTheDocument();
  });

  it('2. Chuyển đổi giữa Đăng nhập và Đăng ký khi bấm "Đăng ký ngay"', async () => {
    const user = userEvent.setup();
    renderLoginPageAt('/login');

    const switchBtn = screen.getByRole('button', { name: /Đăng ký ngay/i });
    await user.click(switchBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Bắt đầu hành trình nâng tầm tri thức/i })).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tối thiểu 6 ký tự')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nhập lại mật khẩu')).toBeInTheDocument();
  });

  it('3. Hiển thị thước đo độ mạnh mật khẩu (Password Strength) ở form đăng ký', async () => {
    const user = userEvent.setup();
    renderLoginPageAt('/register');

    const passwordInput = screen.getByPlaceholderText('Tối thiểu 6 ký tự');

    await user.type(passwordInput, '123456');
    expect(await screen.findByText(/Độ bảo mật mật khẩu:/i)).toBeInTheDocument();
    expect(screen.getByText('Yếu')).toBeInTheDocument();

    await user.clear(passwordInput);
    await user.type(passwordInput, 'P@ssw0rd2026!');
    expect(await screen.findByText('Mạnh')).toBeInTheDocument();
  });

  it('4. Nút hiện/ẩn mật khẩu (Eye / EyeOff) hoạt động chính xác với aria-label', async () => {
    const user = userEvent.setup();
    renderLoginPageAt('/login');

    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: /Hiện mật khẩu/i });
    await user.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /Ẩn mật khẩu/i })).toBeInTheDocument();
  });

  it('5. Chặn submit khi form đăng nhập chưa hợp lệ và hiển thị lỗi inline', async () => {
    const user = userEvent.setup();
    renderLoginPageAt('/login');

    const emailInput = screen.getByPlaceholderText('student@lms.com');
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập$/i });

    await user.type(emailInput, 'invalid-email');
    await user.tab();

    expect(await screen.findByText(/Email không đúng định dạng/i)).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  it('6. Luồng đăng nhập thành công điều hướng người dùng', async () => {
    const user = userEvent.setup();
    renderLoginPageAt('/login');

    const emailInput = screen.getByPlaceholderText('student@lms.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập$/i });

    await user.type(emailInput, 'student@lms.com');
    await user.type(passwordInput, 'student123');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Trang Chủ Test')).toBeInTheDocument();
    });
  });
});

