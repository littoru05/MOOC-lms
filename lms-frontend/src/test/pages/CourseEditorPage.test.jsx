import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { CourseEditorPage } from '../../pages/instructor/CourseEditorPage';
import { CoursePlayerPage } from '../../pages/student/CoursePlayerPage';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

const renderCourseEditorPage = (courseId = 1) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/instructor/courses/editor?courseId=${courseId}`]}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/instructor/courses/editor" element={<CourseEditorPage />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CourseEditorPage Component', () => {
  it('nạp dữ liệu khóa học từ React Query và hiển thị đúng các trường form', async () => {
    renderCourseEditorPage(1);

    await waitFor(() => {
      expect(screen.getByDisplayValue(/Lập trình Fullstack Web hiện đại/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Lưu toàn bộ thông tin/i })).toBeInTheDocument();
    expect(screen.getByText(/Chương 1: Khởi động dự án/i)).toBeInTheDocument();
  });

  it('cùng một khóa học thì CourseEditorPage và CoursePlayerPage đều hiển thị cùng các chương và bài giảng', async () => {
    const queryClient = createTestQueryClient();

    // 1. Kiểm tra trên CourseEditorPage cho khóa 1
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/instructor/courses/editor?courseId=1']}>
          <ToastProvider>
            <AuthProvider>
              <Routes>
                <Route path="/instructor/courses/editor" element={<CourseEditorPage />} />
              </Routes>
            </AuthProvider>
          </ToastProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Chương 1: Khởi động dự án/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Bài 1: Giới thiệu hệ sinh thái LMS/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Bài 2: Cài đặt JDK 21 & Node.js/i).length).toBeGreaterThanOrEqual(1);
    });

    unmount();

    // 2. Kiểm tra trên CoursePlayerPage cho khóa 1
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/learn/1']}>
          <ToastProvider>
            <AuthProvider>
              <Routes>
                <Route path="/learn/:courseId" element={<CoursePlayerPage />} />
              </Routes>
            </AuthProvider>
          </ToastProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Chương 1: Khởi động dự án/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Bài 1: Giới thiệu hệ sinh thái LMS/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Bài 2: Cài đặt JDK 21 & Node.js/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
