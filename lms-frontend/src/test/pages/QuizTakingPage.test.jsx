import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { QuizTakingPage } from '../../pages/student/QuizTakingPage';

const renderQuizTakingPage = (onCompleteQuiz = vi.fn()) => {
  return render(
    <MemoryRouter initialEntries={['/quiz/1/take?enrollmentId=100']}>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route
              path="/quiz/:quizId/take"
              element={<QuizTakingPage onCompleteQuiz={onCompleteQuiz} />}
            />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
};

describe('QuizTakingPage Component with MSW', () => {
  it('tải và hiển thị đề thi trắc nghiệm, các câu hỏi và lựa chọn', async () => {
    renderQuizTakingPage();

    await waitFor(() => {
      expect(screen.getByText(/Bài thi tổng kết kiến thức/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Spring Boot sử dụng cổng mặc định nào\?/i)).toBeInTheDocument();
    expect(screen.getByText('8080')).toBeInTheDocument();
    expect(screen.getByText('3000')).toBeInTheDocument();
    expect(screen.getByText(/JSX là gì trong React\?/i)).toBeInTheDocument();
  });

  it('học viên chọn đáp án và nộp bài thi thành công', async () => {
    const user = userEvent.setup();
    const handleComplete = vi.fn();

    renderQuizTakingPage(handleComplete);

    await waitFor(() => {
      expect(screen.getByText('8080')).toBeInTheDocument();
    });

    // Chọn đáp án câu 1
    const ans1 = screen.getByText('8080');
    await user.click(ans1);

    // Chọn đáp án câu 2
    const ans2 = screen.getByText(/Cú pháp mở rộng JavaScript/i);
    await user.click(ans2);

    // Bấm Nộp bài thi
    const submitBtn = screen.getByRole('button', { name: /Hoàn tất & Nộp bài kiểm tra/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(handleComplete).toHaveBeenCalled();
    });
  });
});
