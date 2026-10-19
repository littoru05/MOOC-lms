import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as AuthContextModule from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { CheckoutPage } from '../../pages/student/CheckoutPage';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { mockCartState } from '../mocks/handlers';

let testQueryClient;

const renderCheckoutPage = () => {
  testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter initialEntries={['/checkout']}>
        <ToastProvider>
          <CheckoutPage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CheckoutPage Component with Simplified QR Payment', () => {
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

  it('hiển thị tóm tắt đơn hàng và thông tin chuyển khoản VietQR', async () => {
    renderCheckoutPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Thanh toán' })).toBeInTheDocument();
      expect(screen.getByText('Chuyển khoản qua mã QR')).toBeInTheDocument();
      expect(
        screen.getByText("Quét mã bằng ứng dụng ngân hàng để chuyển khoản, sau đó bấm 'Tôi đã thanh toán'.")
      ).toBeInTheDocument();
      expect(screen.getByText('Đây là bản minh họa, không phát sinh giao dịch thật.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tôi đã thanh toán/i })).toBeInTheDocument();
      expect(screen.getByText(/Tóm tắt đơn hàng/i)).toBeInTheDocument();
      expect(screen.getByText('Kiến trúc Vi dịch vụ và Cloud Native')).toBeInTheDocument();
      expect(screen.getAllByText('499.000₫').length).toBeGreaterThan(0);
    });
  });

  it('bấm nút "Tôi đã thanh toán" hoàn tất đơn hàng và làm sạch giỏ', async () => {
    renderCheckoutPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Tôi đã thanh toán/i })).toBeInTheDocument();
    });

    const payButton = screen.getByRole('button', { name: /Tôi đã thanh toán/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(mockCartState.items.length).toBe(0);
    });
  });

  it('hiển thị thông báo khi giỏ hàng trống', async () => {
    mockCartState.items = [];
    mockCartState.totalPrice = 0;
    mockCartState.totalItems = 0;

    renderCheckoutPage();

    await waitFor(() => {
      expect(screen.getByText('Giỏ hàng của bạn đang trống')).toBeInTheDocument();
      expect(screen.getByText('Khám phá khóa học để bắt đầu.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Khám phá khóa học/i })).toBeInTheDocument();
    });
  });
});
