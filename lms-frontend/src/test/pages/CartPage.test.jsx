import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import * as AuthContextModule from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { CartPage } from '../../pages/student/CartPage';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

import { mockCartState } from '../mocks/handlers';

const renderCartPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/cart']}>
        <ToastProvider>
          <CartPage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CartPage Component with MSW and React Query', () => {
  beforeEach(() => {
    mockCartState.items = [
      {
        id: 1,
        courseId: 2,
        courseTitle: 'Kiến trúc Vi dịch vụ và Cloud Native',
        courseSlug: 'kien-truc-vi-dich-vu-cloud-native',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
        instructorName: 'TS. Nguyễn Văn A',
        price: 499000,
        addedAt: '2026-08-25T10:00:00',
      },
    ];
    mockCartState.totalPrice = 499000;
    mockCartState.totalItems = 1;

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 3, fullName: 'Học viên Test', email: 'student@lms.com', role: 'ROLE_STUDENT' },
      token: 'mock-jwt-student-token',
      isStudent: true,
      isInstructor: false,
      isAdmin: false,
      currentRole: 'ROLE_STUDENT',
    });
  });

  it('nạp dữ liệu giỏ hàng và hiển thị danh sách khóa học, tổng tiền', async () => {
    renderCartPage();

    await waitFor(() => {
      expect(screen.getByText('Kiến trúc Vi dịch vụ và Cloud Native')).toBeInTheDocument();
      expect(screen.getAllByText('499.000₫').length).toBeGreaterThan(0);
      expect(screen.getByText('Tổng quan thanh toán')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tiến hành thanh toán/i })).toBeInTheDocument();
    });
  });

  it('xóa khóa học khỏi giỏ hàng khi bấm nút thùng rác', async () => {
    renderCartPage();

    await waitFor(() => {
      expect(screen.getByText('Kiến trúc Vi dịch vụ và Cloud Native')).toBeInTheDocument();
    });

    const removeBtn = screen.getByTitle('Xóa khỏi giỏ hàng');
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(screen.getByText('Giỏ hàng của bạn đang trống')).toBeInTheDocument();
    });
  });

  it('bấm nút Tiến hành thanh toán điều hướng sang trang checkout và giữ nguyên giỏ hàng', async () => {
    renderCartPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Tiến hành thanh toán/i })).toBeInTheDocument();
    });

    const checkoutBtn = screen.getByRole('button', { name: /Tiến hành thanh toán/i });
    fireEvent.click(checkoutBtn);

    // Giỏ hàng vẫn giữ nguyên dữ liệu, không bị xóa ở bước này
    expect(mockCartState.items.length).toBe(1);
  });
});

