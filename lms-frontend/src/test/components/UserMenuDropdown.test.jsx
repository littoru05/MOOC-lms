import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserMenuDropdown } from '../../components/common/UserMenuDropdown';
import * as AuthContextModule from '../../context/AuthContext';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderDropdown = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <UserMenuDropdown />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('UserMenuDropdown Component', () => {
  it('does not render when user is null', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      logout: vi.fn(),
      isInstructor: false,
      isAdmin: false,
      currentRole: 'ROLE_STUDENT',
    });

    const { container } = renderDropdown();

    expect(container.firstChild).toBeNull();
  });

  it('renders avatar button, opens dropdown on click, and displays student sections', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 3, fullName: 'Học viên Test', email: 'student@lms.com', role: 'ROLE_STUDENT' },
      logout: vi.fn(),
      isStudent: true,
      isInstructor: false,
      isAdmin: false,
      currentRole: 'ROLE_STUDENT',
    });

    renderDropdown();

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Click to open dropdown
    fireEvent.click(button);

    expect(screen.getByText('Học viên Test')).toBeInTheDocument();
    expect(screen.getByText('student@lms.com')).toBeInTheDocument();
    expect(screen.getByText('Khóa học của tôi')).toBeInTheDocument();
    expect(screen.getByText('Chứng chỉ của tôi')).toBeInTheDocument();
    expect(screen.getByText('Giỏ hàng của tôi')).toBeInTheDocument();
    expect(screen.getByText('Lịch sử đơn hàng')).toBeInTheDocument();
    expect(screen.getByText('Hồ sơ cá nhân')).toBeInTheDocument();
    expect(screen.getByText('Đăng xuất')).toBeInTheDocument();
  });

  it('renders instructor dashboard button when user is instructor and hides student learning/cart', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 2, fullName: 'TS. Nguyễn Văn A', email: 'instructor@lms.com', role: 'ROLE_INSTRUCTOR' },
      logout: vi.fn(),
      isStudent: false,
      isInstructor: true,
      isAdmin: false,
      currentRole: 'ROLE_INSTRUCTOR',
    });

    renderDropdown();

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Bảng điều khiển Giảng viên')).toBeInTheDocument();
    expect(screen.queryByText('Trang Quản trị Admin')).not.toBeInTheDocument();
    expect(screen.queryByText('Khóa học của tôi')).not.toBeInTheDocument();
    expect(screen.queryByText('Chứng chỉ của tôi')).not.toBeInTheDocument();
    expect(screen.queryByText('Giỏ hàng của tôi')).not.toBeInTheDocument();
    expect(screen.queryByText('Lịch sử đơn hàng')).not.toBeInTheDocument();
  });

  it('renders admin portal when user is admin and hides instructor portal and student learning/cart', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 1, fullName: 'Admin Quản trị', email: 'admin@lms.com', role: 'ROLE_ADMIN' },
      logout: vi.fn(),
      isStudent: false,
      isInstructor: false,
      isAdmin: true,
      currentRole: 'ROLE_ADMIN',
    });

    renderDropdown();

    fireEvent.click(screen.getByRole('button'));

    expect(screen.queryByText('Bảng điều khiển Giảng viên')).not.toBeInTheDocument();
    expect(screen.getByText('Trang Quản trị Admin')).toBeInTheDocument();
    expect(screen.queryByText('Khóa học của tôi')).not.toBeInTheDocument();
    expect(screen.queryByText('Chứng chỉ của tôi')).not.toBeInTheDocument();
    expect(screen.queryByText('Giỏ hàng của tôi')).not.toBeInTheDocument();
    expect(screen.queryByText('Lịch sử đơn hàng')).not.toBeInTheDocument();
  });

  it('navigates to /cart and /orders on click for student', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 3, fullName: 'Học viên Test', email: 'student@lms.com', role: 'ROLE_STUDENT' },
      logout: vi.fn(),
      isStudent: true,
      isInstructor: false,
      isAdmin: false,
      currentRole: 'ROLE_STUDENT',
    });

    renderDropdown();

    fireEvent.click(screen.getByRole('button'));

    fireEvent.click(screen.getByText('Giỏ hàng của tôi'));
    expect(mockNavigate).toHaveBeenCalledWith('/cart');

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Lịch sử đơn hàng'));
    expect(mockNavigate).toHaveBeenCalledWith('/orders');
  });
});
