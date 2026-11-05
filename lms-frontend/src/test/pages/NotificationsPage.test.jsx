import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationsPage } from '../../pages/common/NotificationsPage';
import { renderWithAllProviders } from '../test-utils';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import * as AuthContextModule from '../../context/AuthContext';

describe('NotificationsPage', () => {
  const mockUser = {
    id: 1,
    fullName: 'Admin Test',
    email: 'admin@lms.com',
    role: 'ADMIN',
  };

  beforeEach(() => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isAdmin: true,
      isInstructor: false,
    });
  });

  it('renders page title and notification list', async () => {
    renderWithAllProviders(<NotificationsPage portal="admin" />);

    expect(screen.getByText('Trung tâm thông báo')).toBeInTheDocument();
    expect(screen.getByText('Tất cả thông báo')).toBeInTheDocument();
    expect(screen.getByText(/Chưa đọc/)).toBeInTheDocument();

    expect(await screen.findByText('Khóa học mới chờ phê duyệt')).toBeInTheDocument();
    expect(screen.getByText('Yêu cầu xóa khóa học')).toBeInTheDocument();
  });

  it('switches between all and unread tabs', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<NotificationsPage portal="instructor" />);

    const unreadTab = await screen.findByRole('button', { name: /Chưa đọc/i });
    await user.click(unreadTab);

    // Both unread notifications should still be visible
    expect(await screen.findByText('Khóa học mới chờ phê duyệt')).toBeInTheDocument();
    expect(screen.getByText('Yêu cầu xóa khóa học')).toBeInTheDocument();
  });

  it('marks all as read when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<NotificationsPage portal="admin" />);

    const markAllBtn = await screen.findByRole('button', { name: /Đánh dấu đã đọc tất cả/i });
    await user.click(markAllBtn);

    // After marking all as read, button disappears
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Đánh dấu đã đọc tất cả/i })).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no notifications exist', async () => {
    server.use(
      http.get('*/api/v1/notifications', () => {
        return HttpResponse.json({
          content: [],
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
          unreadCount: 0,
        });
      })
    );

    renderWithAllProviders(<NotificationsPage portal="admin" />);

    expect(await screen.findByText('Bạn chưa có thông báo nào')).toBeInTheDocument();
  });
});
