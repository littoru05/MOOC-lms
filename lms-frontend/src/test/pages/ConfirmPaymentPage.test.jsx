import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, expect, it, beforeEach } from 'vitest';
import { ConfirmPaymentPage } from '../../pages/student/ConfirmPaymentPage';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { mockPaymentSessionState } from '../mocks/handlers';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const renderConfirmPage = (token = 'mock-session-uuid-1234') => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/checkout/confirm/${token}`]}>
        <Routes>
          <Route path="/checkout/confirm/:token" element={<ConfirmPaymentPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ConfirmPaymentPage Mobile Component', () => {
  beforeEach(() => {
    mockPaymentSessionState.status = 'PENDING';
    mockPaymentSessionState.sessionToken = 'mock-session-uuid-1234';
  });

  it('tự động xác nhận thanh toán khi trang load và hiển thị thông báo quay lại máy tính', async () => {
    renderConfirmPage();

    await waitFor(() => {
      expect(screen.getByText('Xác nhận thành công!')).toBeInTheDocument();
      expect(screen.getByText(/Đã xác nhận! Quay lại máy tính để tiếp tục./i)).toBeInTheDocument();
    });
  });

  it('hiển thị thông báo khi mã QR đã hết hạn', async () => {
    mockPaymentSessionState.status = 'EXPIRED';

    renderConfirmPage();

    await waitFor(() => {
      expect(screen.getByText('Mã QR đã hết hạn')).toBeInTheDocument();
      expect(screen.getByText(/Phiên thanh toán đã hết hạn sau 5 phút/i)).toBeInTheDocument();
    });
  });

  it('hiển thị thông báo lỗi kết nối máy chủ khi gặp lỗi mạng (Network Error)', async () => {
    server.use(
      http.get('*/api/v1/payment-sessions/:token/status', () => {
        return HttpResponse.error();
      })
    );

    renderConfirmPage();

    await waitFor(() => {
      expect(screen.getByText('Không thể kết nối máy chủ')).toBeInTheDocument();
      expect(screen.getByText(/Không thể kết nối tới máy chủ, vui lòng kiểm tra kết nối mạng/i)).toBeInTheDocument();
    });
  });

  it('hiển thị thông báo phiên thanh toán không hợp lệ khi server phản hồi lỗi 404', async () => {
    server.use(
      http.get('*/api/v1/payment-sessions/:token/status', () => {
        return HttpResponse.json({ message: 'Session not found' }, { status: 404 });
      })
    );

    renderConfirmPage();

    await waitFor(() => {
      expect(screen.getByText('Phiên thanh toán không hợp lệ')).toBeInTheDocument();
      expect(screen.getByText(/Mã phiên không tồn tại hoặc đã bị hủy/i)).toBeInTheDocument();
    });
  });
});
