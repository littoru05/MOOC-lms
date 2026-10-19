import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { ExplorePage } from '../../pages/student/ExplorePage';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

const renderExplorePage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <ExplorePage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ExplorePage Component with React Query and MSW', () => {
  it('tải và hiển thị danh sách khóa học từ Mock API MSW', async () => {
    renderExplorePage();

    // Kiểm tra hero banner
    expect(screen.getByText(/Khám phá tri thức, làm chủ công nghệ tương lai/i)).toBeInTheDocument();

    // Chờ các khóa học từ API render
    await waitFor(() => {
      expect(
        screen.getAllByText(/Lập trình Fullstack Web hiện đại với React và Spring Boot/i)[0]
      ).toBeInTheDocument();
    });
  });

  it('hiển thị danh mục các khóa học và bộ lọc', async () => {
    renderExplorePage();

    await waitFor(() => {
      expect(screen.getAllByText(/Lập trình Web/i).length).toBeGreaterThan(0);
    });
  });

  it('phân trang đúng khi số lượng khóa học lớn hơn PAGE_SIZE (6)', async () => {
    // Giả lập 14 khóa học để kiểm tra phân trang (3 trang: 6 + 6 + 2)
    const mockManyCourses = Array.from({ length: 14 }, (_, i) => ({
      id: i + 1,
      title: `Khóa học thử nghiệm số ${i + 1}`,
      slug: `khoa-hoc-thu-nghiem-so-${i + 1}`,
      description: `Mô tả ngắn gọn về khóa học ${i + 1}`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
      price: 199000 * (i + 1),
      level: 'BEGINNER',
      status: 'PUBLISHED',
      categorySlug: 'lap-trinh-web',
      categoryId: 1,
      categoryName: 'Lập trình Web',
      enrolledCount: 10 + i,
      instructorName: 'TS. Nguyễn Văn A',
    }));

    server.use(
      http.get('*/api/v1/courses/public', () => {
        return HttpResponse.json(mockManyCourses);
      })
    );

    renderExplorePage();

    const catalog = document.getElementById('course-catalog-section');
    expect(catalog).not.toBeNull();

    // Chờ render trang 1: hiển thị khóa 1..6, counter hiển thị Trang 1/3
    await waitFor(() => {
      expect(within(catalog).getByText(/Trang 1\/3/i)).toBeInTheDocument();
    });

    expect(within(catalog).getByText('Khóa học thử nghiệm số 1')).toBeInTheDocument();
    expect(within(catalog).getByText('Khóa học thử nghiệm số 6')).toBeInTheDocument();
    expect(within(catalog).queryByText('Khóa học thử nghiệm số 7')).not.toBeInTheDocument();

    // Bấm nút chuyển sang Trang 2
    const page2Button = within(catalog).getByRole('button', { name: '2' });
    fireEvent.click(page2Button);

    // Chờ render trang 2: hiển thị khóa 7..12
    await waitFor(() => {
      expect(within(catalog).getByText(/Trang 2\/3/i)).toBeInTheDocument();
    });

    expect(within(catalog).getByText('Khóa học thử nghiệm số 7')).toBeInTheDocument();
    expect(within(catalog).getByText('Khóa học thử nghiệm số 12')).toBeInTheDocument();
    expect(within(catalog).queryByText('Khóa học thử nghiệm số 1')).not.toBeInTheDocument();
    expect(within(catalog).queryByText('Khóa học thử nghiệm số 13')).not.toBeInTheDocument();
  });
});
