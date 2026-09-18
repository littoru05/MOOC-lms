import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { CourseDetailPage } from '../../pages/student/CourseDetailPage';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

const renderCourseDetailPage = (slug = 'lap-trinh-fullstack-web-react-spring-boot', userMock = null) => {
  if (userMock) {
    localStorage.setItem('user_cache', JSON.stringify(userMock));
    localStorage.setItem('token', 'valid-test-token');
  }

  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/courses/${slug}`]}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/courses/:slug" element={<CourseDetailPage />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CourseDetailPage Component with MSW', () => {
  it('hiển thị đầy đủ thông tin khóa học, giảng viên và các chương học', async () => {
    renderCourseDetailPage('lap-trinh-fullstack-web-react-spring-boot');

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Lập trình Fullstack Web hiện đại với React và Spring Boot/i })
      ).toBeInTheDocument();
    });

    expect(screen.getAllByText(/TS. Nguyễn Văn A/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Chương 1: Khởi động dự án/i)).toBeInTheDocument();
  });

  it('hiển thị nút Ghi danh khóa học khi học viên chưa ghi danh', async () => {
    renderCourseDetailPage('lap-trinh-fullstack-web-react-spring-boot');

    await waitFor(() => {
      const enrollBtn = screen.getByRole('button', { name: /Ghi danh khóa học ngay/i });
      expect(enrollBtn).toBeInTheDocument();
    });
  });

  it('hiển thị nút Tiếp tục học tập khi học viên đã ghi danh khóa học', async () => {
    const studentUser = {
      id: 3,
      email: 'student@lms.com',
      fullName: 'Trần Văn Học Viên',
      role: 'ROLE_STUDENT',
    };

    renderCourseDetailPage('lap-trinh-fullstack-web-react-spring-boot', studentUser);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Tiếp tục học tập ngay/i })).toBeInTheDocument();
    });
  });

  it('hiển thị thông báo Không tìm thấy khóa học khi slug không tồn tại trên hệ thống', async () => {
    renderCourseDetailPage('khoa-hoc-khong-ton-tai-123456');

    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy khóa học')).toBeInTheDocument();
      expect(screen.getByText('khoa-hoc-khong-ton-tai-123456')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Quay lại danh mục khám phá/i })).toBeInTheDocument();
    });
  });
});
