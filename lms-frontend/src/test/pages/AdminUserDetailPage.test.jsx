import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AdminUserDetailPage } from '../../pages/admin/AdminUserDetailPage';
import { createTestQueryClient } from '../test-utils';
import { ToastProvider } from '../../context/ToastContext';
import { AuthProvider } from '../../context/AuthContext';
import * as AuthContextModule from '../../context/AuthContext';
import * as ToastContextModule from '../../context/ToastContext';

describe('AdminUserDetailPage', () => {
  const mockAdminUser = {
    id: 1,
    fullName: 'Quản trị viên Hệ thống',
    email: 'admin@lms.com',
    role: 'ROLE_ADMIN',
  };

  const mockToast = {
    showToast: vi.fn(),
    confirm: vi.fn(({ onConfirm }) => onConfirm && onConfirm()),
  };

  const renderComponent = (userId = '3') => {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/admin/users/${userId}`]}>
          <ToastProvider>
            <AuthProvider>
              <Routes>
                <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
              </Routes>
            </AuthProvider>
          </ToastProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockAdminUser,
      isAuthenticated: true,
      isAdmin: true,
      isInstructor: false,
    });
    vi.spyOn(ToastContextModule, 'useToast').mockReturnValue(mockToast);
  });

  it('renders masked sensitive info, statistics, and recent activity', async () => {
    renderComponent('3');

    // Verify user profile details loaded
    expect(await screen.findByText('Trần Văn Học Viên')).toBeInTheDocument();
    expect(screen.getByText('@student_mock')).toBeInTheDocument();
    expect(screen.getAllByText(/Học viên/i).length).toBeGreaterThan(0);

    // Verify sensitive data is MASKED
    expect(screen.getByText('t***@g***.com')).toBeInTheDocument();
    expect(screen.getByText('09******78')).toBeInTheDocument();
    expect(screen.getByText('**/**/****')).toBeInTheDocument();
    expect(screen.getByText('***')).toBeInTheDocument();

    // Verify password row
    expect(screen.getByText('••••••••')).toBeInTheDocument();
    expect(screen.getByText(/Mật khẩu được mã hóa một chiều/i)).toBeInTheDocument();

    // Verify statistics cards
    expect(screen.getByText('Đang học')).toBeInTheDocument();
    expect(screen.getAllByText('Hoàn thành').length).toBeGreaterThan(0);
    expect(screen.getByText('Tổng chi')).toBeInTheDocument();

    // Verify recent activity
    expect(screen.getAllByText('Lập trình NestJS Chuyên Sâu').length).toBeGreaterThan(0);
    expect(screen.getByText('ORD-2026-001')).toBeInTheDocument();
    expect(screen.getByText('CERT-2026-NESTJS-88')).toBeInTheDocument();
  });

  it('reveals sensitive info after admin confirms password, shows countdown timer, and hides on "Ẩn ngay"', async () => {
    const user = userEvent.setup();
    renderComponent('3');

    expect(await screen.findByText('Trần Văn Học Viên')).toBeInTheDocument();
    expect(screen.getByText('t***@g***.com')).toBeInTheDocument();

    // Click "Xem thông tin đầy đủ" button
    const revealBtn = screen.getByRole('button', { name: /Xem thông tin đầy đủ/i });
    await user.click(revealBtn);

    // Modal opens asking for admin password
    expect(screen.getByText('Xác thực Quản trị viên')).toBeInTheDocument();
    const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu admin...');

    // Submit correct password
    await user.type(passwordInput, 'admin123');
    const submitBtn = screen.getByRole('button', { name: /Xác thực & Hiển thị/i });
    await user.click(submitBtn);

    // Data should be revealed
    await waitFor(() => {
      expect(screen.getByText('tranvanhocvien@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('0912345678')).toBeInTheDocument();
      expect(screen.getByText('Nam')).toBeInTheDocument();
    });

    // Countdown timer and "Ẩn ngay" button visible
    expect(screen.getByText(/Tự động ẩn sau/i)).toBeInTheDocument();
    const hideBtn = screen.getByRole('button', { name: /Ẩn ngay/i });
    expect(hideBtn).toBeInTheDocument();

    // Click "Ẩn ngay"
    await user.click(hideBtn);

    // Returned to masked state
    await waitFor(() => {
      expect(screen.getByText('t***@g***.com')).toBeInTheDocument();
      expect(screen.queryByText('tranvanhocvien@gmail.com')).not.toBeInTheDocument();
    });
  });

  it('shows 403 error on wrong admin password and 429 when rate limited without logging out', async () => {
    const user = userEvent.setup();
    renderComponent('3');

    expect(await screen.findByText('Trần Văn Học Viên')).toBeInTheDocument();

    // 1. Wrong password test
    await user.click(screen.getByRole('button', { name: /Xem thông tin đầy đủ/i }));
    const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu admin...');
    await user.type(passwordInput, 'WrongPass');
    await user.click(screen.getByRole('button', { name: /Xác thực & Hiển thị/i }));

    expect(await screen.findByText(/Mật khẩu quản trị viên không chính xác/i)).toBeInTheDocument();
    // Modal stays open for retry
    expect(screen.getByText('Xác thực Quản trị viên')).toBeInTheDocument();

    // 2. Rate limit test
    await user.clear(passwordInput);
    await user.type(passwordInput, 'RateLimit');
    await user.click(screen.getByRole('button', { name: /Xác thực & Hiển thị/i }));

    expect(await screen.findByText(/Bạn đã nhập sai quá 5 lần/i)).toBeInTheDocument();
  });

  it('allows admin to reset password and displays 1-time temporary password with copy button', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    try {
      Object.defineProperty(window.navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis.navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });
    } catch {
      // ignore
    }

    const user = userEvent.setup();
    renderComponent('3');

    expect(await screen.findByText('Trần Văn Học Viên')).toBeInTheDocument();

    // Click "Đặt lại mật khẩu"
    const resetBtn = screen.getByRole('button', { name: /Đặt lại mật khẩu/i });
    await user.click(resetBtn);

    // Modal opens
    expect(screen.getByText(/Đặt lại Mật khẩu Người dùng/i)).toBeInTheDocument();
    const adminPassInput = screen.getByPlaceholderText('Nhập mật khẩu admin...');
    await user.type(adminPassInput, 'admin123');

    // Confirm reset
    const confirmResetBtn = screen.getByRole('button', { name: /Xác nhận Đặt lại mật khẩu/i });
    await user.click(confirmResetBtn);

    // Temp password modal appears
    expect(await screen.findByText(/Mật khẩu Tạm thời Mới/i)).toBeInTheDocument();
    expect(screen.getByText('K8#mP9!q')).toBeInTheDocument();
    expect(screen.getByText(/CHỈ HIỂN THỊ MỘT LẦN DUY NHẤT/i)).toBeInTheDocument();

    // Click copy button
    const copyBtn = screen.getByRole('button', { name: /Sao chép/i });
    fireEvent.click(copyBtn);
    expect(mockToast.showToast).toHaveBeenCalledWith('Đã sao chép mật khẩu tạm thời vào bộ nhớ tạm!', 'success');

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /Tôi đã lưu mật khẩu & Đóng/i });
    await user.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('K8#mP9!q')).not.toBeInTheDocument();
    });
  });
});
