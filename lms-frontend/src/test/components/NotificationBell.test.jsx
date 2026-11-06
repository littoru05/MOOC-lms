import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationBell } from '../../components/common/NotificationBell';
import { renderWithAllProviders } from '../test-utils';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import * as AuthContextModule from '../../context/AuthContext';

describe('NotificationBell Component', () => {
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

  it('renders bell icon and displays unread badge count with non-overlapping position', async () => {
    renderWithAllProviders(<NotificationBell />);

    // Check badge count (mock has 2 unread notifications)
    const badge = await screen.findByText('2');
    expect(badge).toBeInTheDocument();
    // Badge has offset classes that position it outside the bell
    expect(badge).toHaveClass('-top-1.5');
    expect(badge).toHaveClass('-right-2');
  });

  it('displays 99+ if unread count exceeds 99', async () => {
    server.use(
      http.get('*/api/v1/notifications/unread-count', () => {
        return HttpResponse.json({ unreadCount: 120, count: 120 });
      })
    );

    renderWithAllProviders(<NotificationBell />);

    const badge = await screen.findByText('99+');
    expect(badge).toBeInTheDocument();
  });

  it('toggles notification dropdown when clicked', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<NotificationBell />);

    const bellBtn = screen.getByLabelText(/thông báo/i);
    await user.click(bellBtn);

    // Dropdown header
    expect(await screen.findByText('Thông báo')).toBeInTheDocument();
    expect(screen.getByText('Đánh dấu đã đọc tất cả')).toBeInTheDocument();
    expect(screen.getByText('Xem tất cả')).toBeInTheDocument();

    // Check notification title in dropdown
    expect(await screen.findByText('Khóa học mới chờ phê duyệt')).toBeInTheDocument();
    expect(screen.getByText('Yêu cầu xóa khóa học')).toBeInTheDocument();
  });

  it('marks all as read and removes blue dots when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<NotificationBell />);

    const bellBtn = screen.getByLabelText(/thông báo/i);
    await user.click(bellBtn);

    // Before clicking mark all read: blue dots exist for unread items
    const blueDotsBefore = document.querySelectorAll('.bg-blue-600.rounded-full');
    expect(blueDotsBefore.length).toBeGreaterThan(0);

    const markAllBtn = await screen.findByText('Đánh dấu đã đọc tất cả');
    await user.click(markAllBtn);

    await waitFor(() => {
      expect(screen.queryByText('2')).not.toBeInTheDocument();
      // Blue dots must be gone
      const blueDotsAfter = document.querySelectorAll('.bg-blue-600.rounded-full');
      expect(blueDotsAfter.length).toBe(0);
    });
  });

  it('marks notification as read and navigates when clicked', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<NotificationBell />);

    const bellBtn = screen.getByLabelText(/thông báo/i);
    await user.click(bellBtn);

    const notifItem = await screen.findByText('Khóa học mới chờ phê duyệt');
    await user.click(notifItem);

    // Dropdown closes after item click
    await waitFor(() => {
      expect(screen.queryByText('Đánh dấu đã đọc tất cả')).not.toBeInTheDocument();
    });
  });

  it('handles backend returning "read" field instead of "isRead" without keeping blue dot stuck', async () => {
    server.use(
      http.get('*/api/v1/notifications', () => {
        return HttpResponse.json({
          content: [
            {
              id: 99,
              title: 'Thông báo đã đọc',
              message: 'Nội dung thông báo',
              read: true, // Backend sent "read" instead of "isRead"
              createdAt: new Date().toISOString(),
            },
          ],
          page: 0,
          size: 8,
          totalElements: 1,
          unreadCount: 0,
        });
      }),
      http.get('*/api/v1/notifications/unread-count', () => {
        return HttpResponse.json({ unreadCount: 0, count: 0 });
      })
    );

    const user = userEvent.setup();
    renderWithAllProviders(<NotificationBell />);

    const bellBtn = screen.getByLabelText(/thông báo/i);
    await user.click(bellBtn);

    expect(await screen.findByText('Thông báo đã đọc')).toBeInTheDocument();

    // No blue dot should be present since read is true
    const blueDots = document.querySelectorAll('.bg-blue-600.rounded-full');
    expect(blueDots.length).toBe(0);
  });

  it('học viên chỉ thấy thông báo thu hồi chứng chỉ và không hiển thị nút Xem tất cả', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 3, fullName: 'Học Viên A', email: 'student@lms.com', role: 'ROLE_STUDENT' },
      isAuthenticated: true,
      isAdmin: false,
      isInstructor: false,
    });

    server.use(
      http.get('*/api/v1/notifications', () => {
        return HttpResponse.json({
          content: [
            {
              id: 101,
              type: 'CERTIFICATE_REVOKED',
              title: 'Chứng chỉ đã bị thu hồi',
              message: 'Chứng chỉ khóa học Lập trình Web đã bị thu hồi do vi phạm.',
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            {
              id: 102,
              type: 'COURSE_APPROVED',
              title: 'Khóa học được duyệt',
              message: 'Khóa học đã được duyệt.',
              isRead: false,
              createdAt: new Date().toISOString(),
            },
          ],
          page: 0,
          size: 8,
          totalElements: 2,
          unreadCount: 2,
        });
      })
    );

    const user = userEvent.setup();
    renderWithAllProviders(<NotificationBell />);

    const bellBtn = screen.getByLabelText(/thông báo/i);
    await user.click(bellBtn);

    // Học viên thấy thông báo thu hồi chứng chỉ
    expect(await screen.findByText('Chứng chỉ đã bị thu hồi')).toBeInTheDocument();
    // Khóa học được duyệt (của giảng viên) bị lọc bỏ
    expect(screen.queryByText('Khóa học được duyệt')).not.toBeInTheDocument();

    // Nút "Xem tất cả" BỊ ẨN đối với học viên
    expect(screen.queryByText('Xem tất cả')).not.toBeInTheDocument();
  });
});
