import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { CourseListingPage } from '../../pages/student/CourseListingPage';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

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

const renderWithRouter = (router) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

const createMockCourses = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Khóa học thử nghiệm số ${i + 1}`,
    slug: `khoa-hoc-thu-nghiem-so-${i + 1}`,
    description: `Mô tả khóa học thử nghiệm số ${i + 1}`,
    price: 100000 * (i + 1),
    level: 'BEGINNER',
    status: 'PUBLISHED',
    categorySlug: 'lap-trinh-web',
    categoryId: 1,
    categoryName: 'Lập trình Web',
    category: {
      id: 1,
      name: 'Lập trình Web',
      slug: 'lap-trinh-web',
    },
    enrolledCount: 100 - i,
    instructorName: 'TS. Nguyễn Văn A',
  }));
};

describe('CourseListingPage Component with Price Filtering & Pagination', () => {
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

  it('lọc hiển thị đúng khóa học và badge danh mục khi chọn danh mục', async () => {
    renderCourseListingPage('/courses?category=lap-trinh-web');

    await waitFor(() => {
      expect(screen.getByText('Lập trình Fullstack Web hiện đại với React và Spring Boot')).toBeInTheDocument();
      expect(screen.getByText('Kiến trúc Vi dịch vụ và Cloud Native')).toBeInTheDocument();
      // Badge danh mục trên card khóa học hiển thị "Lập trình Web"
      expect(screen.getAllByText('Lập trình Web').length).toBeGreaterThan(0);
    });
  });

  it('khi đang lọc giá, chuyển sang lọc danh mục thì danh sách khóa học hiển thị đúng thay vì bị rỗng', async () => {
    renderCourseListingPage('/courses?priceType=paid');

    const select = screen.getByLabelText('Chọn danh mục');
    // Chuyển sang lọc danh mục lap-trinh-web và bấm Tất cả giá
    fireEvent.change(select, { target: { value: 'lap-trinh-web' } });
    const allPriceBtn = screen.getByRole('button', { name: 'Tất cả' });
    fireEvent.click(allPriceBtn);

    await waitFor(() => {
      // Phải có khóa học hiển thị, không bị rơi vào Empty state "Chưa có khóa học nào trong chủ đề này"
      expect(screen.queryByText('Chưa có khóa học nào trong chủ đề này')).not.toBeInTheDocument();
      expect(screen.getByText('Lập trình Fullstack Web hiện đại với React và Spring Boot')).toBeInTheDocument();
    });
  });

  // ==========================================
  // PAGINATION TESTS (Theo yêu cầu phân trang)
  // ==========================================

  it('20 khóa thì có 3 trang, hiển thị 9 khóa mỗi trang và thông tin "Hiển thị 10-18 trong 20 khóa học"', async () => {
    const mock20Courses = createMockCourses(20);
    server.use(
      http.get('*/api/v1/courses/public', () => {
        return HttpResponse.json(mock20Courses);
      })
    );

    renderCourseListingPage('/courses');

    // Chờ trang 1 tải xong: hiển thị khóa 1..9, dòng thông tin "Hiển thị 1-9 trong 20 khóa học"
    await waitFor(() => {
      expect(screen.getByText(/Hiển thị 1-9 trong 20 khóa học/i)).toBeInTheDocument();
      expect(screen.getByText('Khóa học thử nghiệm số 1')).toBeInTheDocument();
      expect(screen.getByText('Khóa học thử nghiệm số 9')).toBeInTheDocument();
      expect(screen.queryByText('Khóa học thử nghiệm số 10')).not.toBeInTheDocument();
    });

    // Có các nút phân trang 1, 2, 3
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();

    // Chuyển sang trang 2
    const page2Btn = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Btn);

    // Trang 2: "Hiển thị 10-18 trong 20 khóa học", có khóa 10..18
    await waitFor(() => {
      expect(screen.getByText(/Hiển thị 10-18 trong 20 khóa học/i)).toBeInTheDocument();
      expect(screen.getByText('Khóa học thử nghiệm số 10')).toBeInTheDocument();
      expect(screen.getByText('Khóa học thử nghiệm số 18')).toBeInTheDocument();
      expect(screen.queryByText('Khóa học thử nghiệm số 9')).not.toBeInTheDocument();
      expect(screen.queryByText('Khóa học thử nghiệm số 19')).not.toBeInTheDocument();
    });

    // Chuyển sang trang 3
    const page3Btn = screen.getByRole('button', { name: '3' });
    fireEvent.click(page3Btn);

    // Trang 3: "Hiển thị 19-20 trong 20 khóa học", có khóa 19..20
    await waitFor(() => {
      expect(screen.getByText(/Hiển thị 19-20 trong 20 khóa học/i)).toBeInTheDocument();
      expect(screen.getByText('Khóa học thử nghiệm số 19')).toBeInTheDocument();
      expect(screen.getByText('Khóa học thử nghiệm số 20')).toBeInTheDocument();
      expect(screen.queryByText('Khóa học thử nghiệm số 18')).not.toBeInTheDocument();
    });
  });

  it('ẩn phân trang khi số khóa sau khi lọc <= 9', async () => {
    const mock8Courses = createMockCourses(8);
    server.use(
      http.get('*/api/v1/courses/public', () => {
        return HttpResponse.json(mock8Courses);
      })
    );

    renderCourseListingPage('/courses');

    await waitFor(() => {
      expect(screen.getByText(/Hiển thị 1-8 trong 8 khóa học/i)).toBeInTheDocument();
      expect(screen.getByText('Khóa học thử nghiệm số 1')).toBeInTheDocument();
      expect(screen.getByText('Khóa học thử nghiệm số 8')).toBeInTheDocument();
    });

    // Nút phân trang không xuất hiện
    expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
  });

  it('đổi bộ lọc thì về trang 1 (xóa param page)', async () => {
    const mock20Courses = createMockCourses(20);
    server.use(
      http.get('*/api/v1/courses/public', () => {
        return HttpResponse.json(mock20Courses);
      })
    );

    // Khởi tạo ở trang 2
    renderCourseListingPage('/courses?page=2');

    await waitFor(() => {
      expect(screen.getByText(/Hiển thị 10-18 trong 20 khóa học/i)).toBeInTheDocument();
    });

    // Đổi bộ lọc (chọn danh mục khác hoặc chọn giá)
    const select = screen.getByLabelText('Chọn danh mục');
    fireEvent.change(select, { target: { value: 'lap-trinh-web' } });

    // Tự động về trang 1
    await waitFor(() => {
      expect(screen.getByText(/Hiển thị 1-9 trong 20 khóa học/i)).toBeInTheDocument();
      expect(screen.getByText('Khóa học thử nghiệm số 1')).toBeInTheDocument();
      expect(screen.queryByText('Khóa học thử nghiệm số 10')).not.toBeInTheDocument();
    });
  });

  it('?page=99 thì kẹp về trang cuối hợp lệ, không hiện trang trống', async () => {
    const mock20Courses = createMockCourses(20); // 20 khóa -> 3 trang
    server.use(
      http.get('*/api/v1/courses/public', () => {
        return HttpResponse.json(mock20Courses);
      })
    );

    renderCourseListingPage('/courses?page=99');

    // Kẹp về trang cuối là trang 3 (hiển thị khóa 19..20), không hiện trang trống
    await waitFor(() => {
      expect(screen.getByText(/Hiển thị 19-20 trong 20 khóa học/i)).toBeInTheDocument();
      expect(screen.getByText('Khóa học thử nghiệm số 19')).toBeInTheDocument();
      expect(screen.getByText('Khóa học thử nghiệm số 20')).toBeInTheDocument();
      expect(screen.queryByText('Chưa có khóa học nào trong chủ đề này')).not.toBeInTheDocument();
    });

    const page3Btn = screen.getByRole('button', { name: '3' });
    expect(page3Btn).toHaveAttribute('aria-current', 'page');
  });

  it('Back trình duyệt giữ đúng trang', async () => {
    const mock20Courses = createMockCourses(20);
    server.use(
      http.get('*/api/v1/courses/public', () => {
        return HttpResponse.json(mock20Courses);
      })
    );

    const router = createMemoryRouter(
      [
        {
          path: '/courses',
          element: <CourseListingPage />,
        },
      ],
      {
        initialEntries: ['/courses'],
        initialIndex: 0,
      }
    );

    renderWithRouter(router);

    // Chờ trang 1 tải
    await waitFor(() => {
      expect(screen.getByText(/Hiển thị 1-9 trong 20 khóa học/i)).toBeInTheDocument();
      expect(screen.getByText('Khóa học thử nghiệm số 1')).toBeInTheDocument();
    });

    // Chuyển sang trang 2
    const page2Btn = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Btn);

    // Xác nhận đã ở trang 2
    await waitFor(() => {
      expect(screen.getByText(/Hiển thị 10-18 trong 20 khóa học/i)).toBeInTheDocument();
      expect(screen.getByText('Khóa học thử nghiệm số 10')).toBeInTheDocument();
      expect(screen.queryByText('Khóa học thử nghiệm số 1')).not.toBeInTheDocument();
    });

    // Nhấn nút Back trình duyệt
    await act(async () => {
      await router.navigate(-1);
    });

    // Trở về trang 1 chính xác
    await waitFor(() => {
      expect(screen.getByText(/Hiển thị 1-9 trong 20 khóa học/i)).toBeInTheDocument();
      expect(screen.getByText('Khóa học thử nghiệm số 1')).toBeInTheDocument();
      expect(screen.queryByText('Khóa học thử nghiệm số 10')).not.toBeInTheDocument();
    });
  });

  it('lọc danh sách khóa học theo tên khóa học từ ô tìm kiếm trong sidebar', async () => {
    const mockCourses = [
      {
        id: 1,
        title: 'Lập trình ReactJS chuyên sâu',
        slug: 'lap-trinh-reactjs-chuyen-sau',
        description: 'Khóa học React nâng cao',
        price: 200000,
        status: 'PUBLISHED',
        categorySlug: 'lap-trinh-web',
        categoryName: 'Lập trình Web',
        enrolledCount: 50,
      },
      {
        id: 2,
        title: 'Lập trình Python cơ bản',
        slug: 'lap-trinh-python-co-ban',
        description: 'Khóa học Python cho người mới',
        price: 150000,
        status: 'PUBLISHED',
        categorySlug: 'lap-trinh-phan-mem',
        categoryName: 'Lập trình Phần mềm',
        enrolledCount: 30,
      },
    ];

    server.use(
      http.get('*/api/v1/courses/public', () => {
        return HttpResponse.json(mockCourses);
      })
    );

    renderCourseListingPage();

    await waitFor(() => {
      expect(screen.getByText('Lập trình ReactJS chuyên sâu')).toBeInTheDocument();
      expect(screen.getByText('Lập trình Python cơ bản')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Nhập tên khóa học...');
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'ReactJS' } });

    await waitFor(() => {
      expect(screen.getByText('Lập trình ReactJS chuyên sâu')).toBeInTheDocument();
      expect(screen.queryByText('Lập trình Python cơ bản')).not.toBeInTheDocument();
    });

    const clearButton = screen.getByTitle('Xóa lọc tên khóa học');
    expect(clearButton).toBeInTheDocument();
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText('Lập trình ReactJS chuyên sâu')).toBeInTheDocument();
      expect(screen.getByText('Lập trình Python cơ bản')).toBeInTheDocument();
    });
  });
});
