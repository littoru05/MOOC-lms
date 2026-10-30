import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '../test-utils';
import { ToastProvider } from '../../context/ToastContext';
import { AuthProvider } from '../../context/AuthContext';
import { UserManagementPage } from '../../pages/admin/UserManagementPage';

const renderUserManagementPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <UserManagementPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Sinh 25 mock users để test phân trang
const generateMockUsers = (count = 25) => {
  return Array.from({ length: count }, (_, idx) => {
    const id = idx + 1;
    let role = 'ROLE_STUDENT';
    if (id === 1) role = 'ROLE_ADMIN';
    else if (id <= 5) role = 'ROLE_INSTRUCTOR';

    return {
      id,
      fullName: `Người dùng ${id}`,
      email: `user${id}@lms.com`,
      username: `user${id}`,
      role,
      isActive: true,
      createdAt: '2026-01-15T08:00:00',
    };
  });
};

describe('UserManagementPage Component & Pagination', () => {
  it('tải và hiển thị danh sách người dùng mặc định', async () => {
    renderUserManagementPage();

    expect(screen.getByText(/Quản lý Người dùng & Phân quyền Hệ thống/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/admin@lms.com/i)).toBeInTheDocument();
      expect(screen.getByText(/student@lms.com/i)).toBeInTheDocument();
    });
  });

  it('phân trang đúng khi số lượng người dùng vượt quá 10 (25 users)', async () => {
    const mockUsers = generateMockUsers(25);
    server.use(
      http.get('*/api/v1/admin/users', () => {
        return HttpResponse.json(mockUsers);
      })
    );

    const user = userEvent.setup();
    renderUserManagementPage();

    // Chờ tải xong trang 1: hiển thị user 1 đến 10
    await waitFor(() => {
      expect(screen.getByText(/user1@lms.com/i)).toBeInTheDocument();
      expect(screen.getByText(/user10@lms.com/i)).toBeInTheDocument();
    });

    // User 11 không được xuất hiện ở trang 1
    expect(screen.queryByText(/user11@lms.com/i)).not.toBeInTheDocument();

    // Pagination info
    expect(screen.getByText(/Hiển thị/i)).toBeInTheDocument();
    expect(screen.getByText(/trong tổng số/i)).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();

    // Chuyển sang trang 2 bằng nút số "2"
    const page2Btn = screen.getByRole('button', { name: '2' });
    await user.click(page2Btn);

    // Trang 2: xuất hiện user 11 đến 20
    await waitFor(() => {
      expect(screen.getByText(/user11@lms.com/i)).toBeInTheDocument();
      expect(screen.getByText(/user20@lms.com/i)).toBeInTheDocument();
    });
    // User 1 không còn ở trang 2
    expect(screen.queryByText(/user1@lms.com/i)).not.toBeInTheDocument();

    // Chuyển sang trang 3 bằng nút "Sau"
    const nextBtn = screen.getByRole('button', { name: 'Trang sau' });
    await user.click(nextBtn);

    // Trang 3: xuất hiện user 21 đến 25
    await waitFor(() => {
      expect(screen.getByText(/user21@lms.com/i)).toBeInTheDocument();
      expect(screen.getByText(/user25@lms.com/i)).toBeInTheDocument();
    });
  });

  it('tự động reset về trang 1 khi lọc theo tab hoặc tìm kiếm', async () => {
    const mockUsers = generateMockUsers(25);
    server.use(
      http.get('*/api/v1/admin/users', () => {
        return HttpResponse.json(mockUsers);
      })
    );

    const user = userEvent.setup();
    renderUserManagementPage();

    // Chờ tải xong trang 1
    await waitFor(() => {
      expect(screen.getByText(/user1@lms.com/i)).toBeInTheDocument();
    });

    // Đi tới trang 2
    const page2Btn = screen.getByRole('button', { name: '2' });
    await user.click(page2Btn);

    await waitFor(() => {
      expect(screen.getByText(/user11@lms.com/i)).toBeInTheDocument();
    });

    // Gõ tìm kiếm user1 -> Lập tức reset về trang 1 và hiển thị kết quả
    const searchInput = screen.getByPlaceholderText(/Tìm theo tên, email, username.../i);
    await user.type(searchInput, 'user1');

    await waitFor(() => {
      expect(screen.getByText(/user1@lms.com/i)).toBeInTheDocument();
    });

    // Xóa tìm kiếm và chuyển tab "Giảng viên" -> Reset về trang 1
    await user.clear(searchInput);
    const instructorTabBtn = screen.getByRole('button', { name: /Giảng viên/i });
    await user.click(instructorTabBtn);

    await waitFor(() => {
      // 4 giảng viên (user2 -> user5)
      expect(screen.getByText(/user2@lms.com/i)).toBeInTheDocument();
      expect(screen.getByText(/user5@lms.com/i)).toBeInTheDocument();
    });
  });
});

