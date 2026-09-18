import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as AuthContextModule from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { CheckoutPage } from '../../pages/student/CheckoutPage';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { mockCartState, mockPaymentSessionState } from '../mocks/handlers';

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

describe('CheckoutPage Component with QR and Card Demo Payments', () => {
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

    mockPaymentSessionState.status = 'PENDING';

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 3, fullName: 'Học viên Test', email: 'student@lms.com', role: 'ROLE_STUDENT' },
      token: 'mock-jwt-student-token',
      isStudent: true,
      isInstructor: false,
      isAdmin: false,
      currentRole: 'ROLE_STUDENT',
    });
  });

  it('hiển thị tóm tắt đơn hàng và 2 tab phương thức thanh toán', async () => {
    renderCheckoutPage();

    await waitFor(() => {
      expect(screen.getByText('Chọn phương thức thanh toán')).toBeInTheDocument();
      expect(screen.getByText('Quét mã QR (Khuyên dùng)')).toBeInTheDocument();
      expect(screen.getByText('Thẻ Quốc tế (Demo)')).toBeInTheDocument();
      expect(screen.getByText(/Tóm tắt đơn hàng/i)).toBeInTheDocument();
      expect(screen.getByText('Kiến trúc Vi dịch vụ và Cloud Native')).toBeInTheDocument();
    });
  });

  it('tab QR hiển thị trạng thái đang chờ quét mã và tự động checkout khi CONFIRMED', async () => {
    renderCheckoutPage();

    await waitFor(() => {
      expect(screen.getAllByText('Quét mã QR bằng điện thoại').length).toBeGreaterThan(0);
      expect(screen.getByText('Đang chờ quét mã...')).toBeInTheDocument();
    });

    // Giả lập điện thoại xác nhận thành công
    mockPaymentSessionState.status = 'CONFIRMED';
    testQueryClient.invalidateQueries({ queryKey: ['payment-session'] });

    await waitFor(() => {
      expect(mockCartState.items.length).toBe(0);
    });
  });

  it('tab Thẻ validate client-side và thanh toán thành công với CARD khi form hợp lệ', async () => {
    renderCheckoutPage();

    await waitFor(() => {
      expect(screen.getByText('Thẻ Quốc tế (Demo)')).toBeInTheDocument();
    });

    // Chuyển sang Tab Thẻ
    const cardTabBtn = screen.getByText('Thẻ Quốc tế (Demo)');
    fireEvent.click(cardTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Thanh toán bằng thẻ quốc tế (Mô phỏng)')).toBeInTheDocument();
    });

    // Bấm thanh toán ngay khi chưa nhập -> báo lỗi validate client-side
    const submitBtn = screen.getByRole('button', { name: /Thanh toán ngay/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Vui lòng nhập đủ 16 số thẻ (demo)')).toBeInTheDocument();
      expect(screen.getByText('Vui lòng nhập tên chủ thẻ')).toBeInTheDocument();
    });

    // Nhập thông tin thẻ hợp lệ
    const cardNumberInput = screen.getByPlaceholderText('4242 4242 4242 4242');
    const cardHolderInput = screen.getByPlaceholderText('NGUYEN VAN A');
    const expiryInput = screen.getByPlaceholderText('12/28');
    const cvvInput = screen.getByPlaceholderText('123');

    fireEvent.change(cardNumberInput, { target: { value: '4242424242424242' } });
    fireEvent.change(cardHolderInput, { target: { value: 'TRAN VAN TEST' } });
    fireEvent.change(expiryInput, { target: { value: '1229' } });
    fireEvent.change(cvvInput, { target: { value: '888' } });

    // Submit form
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCartState.items.length).toBe(0);
    });
  });

  it('hiển thị thông báo và nút tạo lại khi mã QR đã hết hạn', async () => {
    mockPaymentSessionState.status = 'EXPIRED';

    renderCheckoutPage();

    await waitFor(() => {
      expect(screen.getByText('Mã QR đã hết hạn, vui lòng tạo lại')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tạo mã QR mới/i })).toBeInTheDocument();
    });
  });

  it('hiển thị thông báo khi giỏ hàng trống', async () => {
    mockCartState.items = [];
    mockCartState.totalPrice = 0;
    mockCartState.totalItems = 0;

    renderCheckoutPage();

    await waitFor(() => {
      expect(screen.getByText('Giỏ hàng của bạn đang trống')).toBeInTheDocument();
      expect(screen.getByText('Khám phá khóa học')).toBeInTheDocument();
    });
  });
});
