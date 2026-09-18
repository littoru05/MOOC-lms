import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { CourseEditorPage } from '../../pages/instructor/CourseEditorPage';
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
});
