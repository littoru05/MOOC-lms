import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, createMemoryRouter, RouterProvider, useNavigate } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { LoginPage } from '../../pages/auth/LoginPage';
import { queryClient } from '../../lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Logout Flow, Cache Invalidation & Navigation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    queryClient.clear();
  });

  it('1. Trang /login hiển thị thông báo "Bạn đã đăng xuất thành công." khi state.loggedOut = true', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[{ pathname: '/login', state: { loggedOut: true } }]}>
          <ToastProvider>
            <AuthProvider>
              <LoginPage />
            </AuthProvider>
          </ToastProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Bạn đã đăng xuất thành công.')).toBeInTheDocument();
  });

  it('2. Trang /login hiển thị thông báo phiên hết hạn khi state.expired = true', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[{ pathname: '/login', state: { expired: true, message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' } }]}>
          <ToastProvider>
            <AuthProvider>
              <LoginPage />
            </AuthProvider>
          </ToastProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.')).toBeInTheDocument();
  });

  it('3. Người dùng đã đăng nhập khi truy cập /login được tự động chuyển hướng về trang theo role, không hiện form', async () => {
    server.use(
      http.post('*/api/v1/auth/refresh', () => {
        return HttpResponse.json({
          token: 'mock-instructor-token',
          id: 2,
          fullName: 'TS. Giảng Viên Test',
          email: 'instructor@lms.com',
          role: 'ROLE_INSTRUCTOR',
        });
      })
    );

    const router = createMemoryRouter(
      [
        {
          path: '/login',
          element: <LoginPage />,
        },
        {
          path: '/instructor/dashboard',
          element: <div>Trang Bảng Điều Khiển Giảng Viên</div>,
        },
      ],
      { initialEntries: ['/login'] }
    );

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Trang Bảng Điều Khiển Giảng Viên')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('student@lms.com')).not.toBeInTheDocument();
    });
  });

  it('4. Khi đăng xuất, queryClient.clear() được gọi và dữ liệu cache cũ bị xóa hoàn toàn', async () => {
    const clearSpy = vi.spyOn(queryClient, 'clear');

    queryClient.setQueryData(['cart'], {
      id: 99,
      items: [{ id: 1, courseTitle: 'Khóa học của người cũ', price: 500000 }],
      totalAmount: 500000,
    });
    expect(queryClient.getQueryData(['cart'])).toBeDefined();

    const TestLogoutComponent = () => {
      const { logout } = useAuth();
      return (
        <button onClick={() => logout()}>Thực hiện đăng xuất</button>
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <TestLogoutComponent />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByText('Thực hiện đăng xuất'));

    await waitFor(() => {
      expect(clearSpy).toHaveBeenCalled();
      expect(queryClient.getQueryData(['cart'])).toBeUndefined();
    });
  });

  it('5. Luồng đăng xuất dùng replace: true về /login và Back không quay lại trang yêu cầu đăng nhập', async () => {
    server.use(
      http.post('*/api/v1/auth/refresh', () => {
        return HttpResponse.json({
          token: 'mock-student-token',
          id: 3,
          fullName: 'Học viên A',
          email: 'student@lms.com',
          role: 'ROLE_STUDENT',
        });
      })
    );

    const MyLearningComponent = () => {
      const { logout } = useAuth();
      const navigate = useNavigate();

      return (
        <div>
          <h1>Khóa học của tôi</h1>
          <button
            onClick={async () => {
              await logout();
              navigate('/login', { replace: true, state: { loggedOut: true } });
            }}
          >
            Đăng xuất
          </button>
        </div>
      );
    };

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <div>Trang chủ</div>,
        },
        {
          path: '/my-learning',
          element: <MyLearningComponent />,
        },
        {
          path: '/login',
          element: <LoginPage />,
        },
      ],
      {
        initialEntries: ['/', '/my-learning'],
        initialIndex: 1,
      }
    );

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Khóa học của tôi')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Đăng xuất'));

    await waitFor(() => {
      expect(screen.getByText('Bạn đã đăng xuất thành công.')).toBeInTheDocument();
    });

    await act(async () => {
      await router.navigate(-1);
    });

    // Vì /login dùng replace: true thay thế vị trí /my-learning, Back quay về trang trước đó (Trang chủ /)
    await waitFor(() => {
      expect(screen.queryByText('Khóa học của tôi')).not.toBeInTheDocument();
      expect(screen.getByText('Trang chủ')).toBeInTheDocument();
    });
  });
});
