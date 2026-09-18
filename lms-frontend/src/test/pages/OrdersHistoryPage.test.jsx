import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import * as AuthContextModule from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { OrdersHistoryPage } from '../../pages/student/OrdersHistoryPage';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

const renderOrdersPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/orders']}>
        <ToastProvider>
          <OrdersHistoryPage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('OrdersHistoryPage Component with MSW and React Query', () => {
  beforeEach(() => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 3, fullName: 'Học viên Test', email: 'student@lms.com', role: 'ROLE_STUDENT' },
      token: 'mock-jwt-student-token',
      isStudent: true,
      isInstructor: false,
      isAdmin: false,
      currentRole: 'ROLE_STUDENT',
    });
  });

  it('hiển thị danh sách lịch sử đơn hàng từ API', async () => {
    renderOrdersPage();

    await waitFor(() => {
      expect(screen.getByText('ORD-MOCK123456')).toBeInTheDocument();
      expect(screen.getByText('Kiến trúc Vi dịch vụ và Cloud Native')).toBeInTheDocument();
      expect(screen.getByText('Hoàn tất')).toBeInTheDocument();
      expect(screen.getByText('Đã thanh toán qua QR')).toBeInTheDocument();
      expect(screen.getByText('Vào học')).toBeInTheDocument();
    });
  });
});
