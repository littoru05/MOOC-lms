import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { CourseListingPage } from '../../pages/student/CourseListingPage';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

const renderCourseListingPage = (initialRoute = '/courses') => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <ToastProvider>
          <AuthProvider>
            <CourseListingPage />
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CourseListingPage Component with Price Filtering', () => {
  it('hiển thị đầy đủ bộ lọc học phí với các nút Tất cả, Miễn phí, Có phí', async () => {
    renderCourseListingPage();

    expect(screen.getByText('Học phí')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tất cả' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Miễn phí' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Có phí' })).toBeInTheDocument();
  });

  it('lọc danh sách khóa học khi chọn tab Miễn phí', async () => {
    renderCourseListingPage();

    const freeBtn = screen.getByRole('button', { name: 'Miễn phí' });
    fireEvent.click(freeBtn);

    // Chờ khóa học hiển thị
    await waitFor(() => {
      // Các khóa học có giá 0₫ sẽ hiển thị
      expect(screen.getAllByText(/Lập trình Fullstack Web hiện đại với React và Spring Boot/i)[0]).toBeInTheDocument();
    });
  });

  it('khi chọn Có phí hiển thị ô nhập khoảng giá và chips gợi ý', async () => {
    renderCourseListingPage();

    const paidBtn = screen.getByRole('button', { name: 'Có phí' });
    fireEvent.click(paidBtn);

    await waitFor(() => {
      expect(screen.getByText('Khoảng giá:')).toBeInTheDocument();
      expect(screen.getByText('< 500k')).toBeInTheDocument();
      expect(screen.getByText('500k - 1tr')).toBeInTheDocument();
      expect(screen.getByText('> 1tr')).toBeInTheDocument();
    });
  });

  it('đọc chính xác filter giá từ URL search params', async () => {
    renderCourseListingPage('/courses?priceType=paid&minPrice=100000&maxPrice=500000');

    await waitFor(() => {
      expect(screen.getByText('Khoảng giá:')).toBeInTheDocument();
      expect(screen.getByDisplayValue('100000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('500000')).toBeInTheDocument();
    });
  });

  it('hiển thị dropdown danh mục và tự động chọn danh mục từ URL search params', async () => {
    renderCourseListingPage('/courses?category=lap-trinh-web');

    const select = screen.getByLabelText('Chọn danh mục');
    expect(select).toBeInTheDocument();
    await waitFor(() => {
      expect(select.value).toBe('lap-trinh-web');
    });
  });

  it('kết hợp đồng bộ cả 2 filter danh mục và giá khi thao tác', async () => {
    renderCourseListingPage('/courses?category=lap-trinh-web');

    const select = screen.getByLabelText('Chọn danh mục');
    await waitFor(() => {
      expect(select.value).toBe('lap-trinh-web');
    });

    // Chọn thêm filter Miễn phí
    const freeBtn = screen.getByRole('button', { name: 'Miễn phí' });
    fireEvent.click(freeBtn);

    // Dropdown danh mục vẫn giữ nguyên
    await waitFor(() => {
      expect(select.value).toBe('lap-trinh-web');
    });
  });
});
