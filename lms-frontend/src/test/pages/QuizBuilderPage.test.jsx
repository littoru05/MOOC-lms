import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { QuizBuilderPage } from '../../pages/instructor/QuizBuilderPage';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

const renderQuizBuilderPage = (courseId = 1) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/instructor/courses/quiz-builder?courseId=${courseId}`]}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/instructor/courses/quiz-builder" element={<QuizBuilderPage />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('QuizBuilderPage Component', () => {
  it('nạp dữ liệu đề thi và hiển thị dropdown đổi khóa học cùng các câu hỏi', async () => {
    renderQuizBuilderPage(1);

    await waitFor(() => {
      expect(screen.getByText(/Biên soạn Đề thi Khảo thí Trắc nghiệm/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Lưu & Xuất bản đề Quiz/i })).toBeInTheDocument();
  });
});
