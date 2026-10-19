import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { CourseApprovalPage } from '../../pages/admin/CourseApprovalPage';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

const renderCourseApprovalPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <CourseApprovalPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CourseApprovalPage - Thẩm định chi tiết khóa học chờ duyệt', () => {
  it('hiển thị danh sách khóa học chờ duyệt với đầy đủ danh mục, học phí và giảng viên', async () => {
    renderCourseApprovalPage();

    // Chờ tải danh sách khóa học
    await waitFor(() => {
      expect(screen.getByText('Lập trình Flutter & Dart Xây dựng App Mobile')).toBeInTheDocument();
    });

    // Xác nhận hiển thị badge danh mục
    expect(screen.getAllByText('Lập trình Di động').length).toBeGreaterThan(0);

    // Xác nhận hiển thị thông tin học phí
    expect(screen.getAllByText('299.000₫').length).toBeGreaterThan(0);

    // Xác nhận hiển thị nội dung tổng quát trong tab Tổng quan
    expect(screen.getByText(/Làm chủ Flutter Framework và phát triển ứng dụng di động đa nền tảng/i)).toBeInTheDocument();
  });

  it('chuyển đổi tab xem Đề cương bài học và hiển thị danh sách các chương, bài giảng', async () => {
    renderCourseApprovalPage();

    await waitFor(() => {
      expect(screen.getByText('Lập trình Flutter & Dart Xây dựng App Mobile')).toBeInTheDocument();
    });

    // Bấm sang tab Đề cương bài học
    const curriculumTabBtn = screen.getByRole('button', { name: /Đề cương bài học/i });
    fireEvent.click(curriculumTabBtn);

    // Xác nhận hiển thị tên chương và tên bài giảng
    await waitFor(() => {
      expect(screen.getByText('Nền tảng Ngôn ngữ Dart & Cấu trúc Widget')).toBeInTheDocument();
      expect(screen.getByText(/1.1 Cài đặt Flutter SDK và tạo First App/i)).toBeInTheDocument();
    });

    // Xác nhận hiển thị nút kiểm tra học liệu
    expect(screen.getByRole('link', { name: /Xem học liệu/i })).toHaveAttribute('href', 'https://www.youtube.com/embed/0-S5a0eXPoc');
  });

  it('chuyển đổi tab xem Đề thi trắc nghiệm và hiển thị câu hỏi kèm đáp án đúng', async () => {
    // Mock dữ liệu quiz cho khóa học ID 10
    server.use(
      http.get('*/api/v1/quizzes/course/:courseId', () => {
        return HttpResponse.json([
          {
            id: 88,
            title: 'Khảo thí Cuối khóa Lập trình Flutter',
            durationMinutes: 20,
            passingScore: 80,
            questions: [
              {
                id: 101,
                questionText: 'Widget nào trong Flutter dùng để quản lý trạng thái có thể thay đổi?',
                point: 1,
                answers: [
                  { id: 201, answerText: 'StatefulWidget', isCorrect: true },
                  { id: 202, answerText: 'StatelessWidget', isCorrect: false },
                  { id: 203, answerText: 'InheritedModel', isCorrect: false },
                  { id: 204, answerText: 'Container', isCorrect: false },
                ],
              },
            ],
          },
        ]);
      })
    );

    renderCourseApprovalPage();

    await waitFor(() => {
      expect(screen.getByText('Lập trình Flutter & Dart Xây dựng App Mobile')).toBeInTheDocument();
    });

    // Bấm sang tab Đề thi trắc nghiệm
    const quizTabBtn = screen.getByRole('button', { name: /Đề thi trắc nghiệm/i });
    fireEvent.click(quizTabBtn);

    // Xác nhận hiển thị tiêu đề bài thi và câu hỏi
    await waitFor(() => {
      expect(screen.getByText('Khảo thí Cuối khóa Lập trình Flutter')).toBeInTheDocument();
      expect(screen.getByText(/Widget nào trong Flutter dùng để quản lý trạng thái có thể thay đổi/i)).toBeInTheDocument();
    });

    // Xác nhận đáp án đúng được gắn nhãn
    expect(screen.getByText('StatefulWidget')).toBeInTheDocument();
    expect(screen.getByText('Đúng')).toBeInTheDocument();
  });
});
