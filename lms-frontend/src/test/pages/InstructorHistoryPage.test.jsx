import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InstructorHistoryPage } from '../../pages/instructor/InstructorHistoryPage';
import { renderWithAllProviders } from '../test-utils';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { resetMockInstructorHistory } from '../mocks/handlers';
import * as AuthContextModule from '../../context/AuthContext';
import * as ToastContextModule from '../../context/ToastContext';

describe('InstructorHistoryPage', () => {
  const mockUser = {
    id: 2,
    fullName: 'TS. Nguyễn Văn A',
    email: 'instructor@lms.com',
    role: 'INSTRUCTOR',
  };

  const mockToast = {
    showToast: vi.fn(),
    confirm: vi.fn(),
  };

  beforeEach(() => {
    resetMockInstructorHistory();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isAdmin: false,
      isInstructor: true,
    });
    vi.spyOn(ToastContextModule, 'useToast').mockReturnValue(mockToast);
  });

  it('renders page header, filters and history table', async () => {
    renderWithAllProviders(<InstructorHistoryPage />);

    expect(screen.getByText('Lịch sử khóa học')).toBeInTheDocument();
    expect(screen.getByText('Bộ lọc nhật ký')).toBeInTheDocument();

    // Verify logs rendered
    expect(await screen.findByText('Khởi tạo khóa học mới')).toBeInTheDocument();
    expect(screen.getByText('Giá: Miễn phí → 599.000 ₫')).toBeInTheDocument();
    expect(screen.getByText('Quản trị viên')).toBeInTheDocument();
  });

  it('filters history by action dropdown', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<InstructorHistoryPage />);

    expect(await screen.findByText('Khởi tạo khóa học mới')).toBeInTheDocument();

    const actionSelect = screen.getByLabelText ? screen.getByLabelText('Hành động') : screen.getAllByRole('combobox')[0];
    await user.selectOptions(actionSelect, 'COURSE_UPDATED');

    await waitFor(() => {
      expect(screen.getByText('Giá: Miễn phí → 599.000 ₫')).toBeInTheDocument();
      expect(screen.queryByText('Khởi tạo khóa học mới')).not.toBeInTheDocument();
    });
  });

  it('shows restore button for deleted course and triggers confirm dialog', async () => {
    const user = userEvent.setup();
    mockToast.confirm.mockImplementation(({ onConfirm }) => {
      onConfirm();
    });

    renderWithAllProviders(<InstructorHistoryPage />);

    const restoreBtn = await screen.findByRole('button', { name: /Khôi phục/i });
    expect(restoreBtn).toBeInTheDocument();

    await user.click(restoreBtn);

    expect(mockToast.confirm).toHaveBeenCalled();
  });

  it('shows empty state when no history logs exist', async () => {
    server.use(
      http.get('*/api/v1/instructor/history', () => {
        return HttpResponse.json({
          content: [],
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        });
      })
    );

    renderWithAllProviders(<InstructorHistoryPage />);

    expect(await screen.findByText('Chưa có lịch sử hoạt động')).toBeInTheDocument();
  });
});

