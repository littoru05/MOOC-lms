import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthModal } from '../../components/auth/AuthModal';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>{ui}</AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('AuthModal Component & Form Validation', () => {
  it('render modal đăng nhập khi isOpen=true', () => {
    renderWithProviders(<AuthModal isOpen={true} onClose={vi.fn()} initialMode="login" />);
    expect(screen.getByRole('heading', { name: /Chào mừng bạn trở lại/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('student@lms.com')).toBeInTheDocument();
  });

  it('không render khi isOpen=false', () => {
    renderWithProviders(<AuthModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('heading', { name: /Chào mừng bạn trở lại/i })).not.toBeInTheDocument();
  });

  it('hiển thị lỗi validation khi nhập email sai định dạng trong form Login', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthModal isOpen={true} onClose={vi.fn()} initialMode="login" />);

    const emailInput = screen.getByPlaceholderText('student@lms.com');
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // trigger blur

    expect(await screen.findByText(/Email không đúng định dạng/i)).toBeInTheDocument();
  });

  it('chặn submit form Login khi mật khẩu < 6 ký tự', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthModal isOpen={true} onClose={vi.fn()} initialMode="login" />);

    const emailInput = screen.getByPlaceholderText('student@lms.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập$/i });

    await user.type(emailInput, 'student@lms.com');
    await user.type(passwordInput, '123'); // < 6 chars

    expect(submitBtn).toBeDisabled();
  });

  it('chuyển đổi qua lại giữa form Đăng nhập và form Đăng ký', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthModal isOpen={true} onClose={vi.fn()} initialMode="login" />);

    // Click link chuyển sang đăng ký
    const switchRegisterBtn = screen.getByRole('button', { name: /Đăng ký ngay/i });
    await user.click(switchRegisterBtn);

    expect(await screen.findByRole('heading', { name: /Bắt đầu hành trình nâng tầm tri thức/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nguyễn Văn A')).toBeInTheDocument();
  });

  it('kiểm tra validation form Đăng ký: xác nhận mật khẩu không khớp và chưa tick điều khoản', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthModal isOpen={true} onClose={vi.fn()} initialMode="register" />);

    const nameInput = screen.getByPlaceholderText('Nguyễn Văn A');
    const emailInput = screen.getByPlaceholderText('user@example.com');
    const passwordInput = screen.getByPlaceholderText('Tối thiểu 6 ký tự');
    const confirmInput = screen.getByPlaceholderText('Nhập lại mật khẩu');
    const submitBtn = screen.getByRole('button', { name: /Đăng ký tài khoản/i });

    await user.type(nameInput, 'Trần Học Viên');
    await user.type(emailInput, 'student2@lms.com');
    await user.type(passwordInput, 'secret123');
    await user.type(confirmInput, 'mismatched123');
    await user.tab();

    expect(await screen.findByText(/Mật khẩu xác nhận không khớp/i)).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  it('đăng nhập thành công và gọi onAuthSuccess callback', async () => {
    const user = userEvent.setup();
    const handleAuthSuccess = vi.fn();

    renderWithProviders(
      <AuthModal isOpen={true} onClose={vi.fn()} initialMode="login" onAuthSuccess={handleAuthSuccess} />
    );

    const emailInput = screen.getByPlaceholderText('student@lms.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập$/i });

    await user.type(emailInput, 'student@lms.com');
    await user.type(passwordInput, 'student123');

    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(handleAuthSuccess).toHaveBeenCalledWith('ROLE_STUDENT');
    });
  });
});
