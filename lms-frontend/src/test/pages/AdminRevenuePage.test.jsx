import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import * as AdminRevenueHooks from '../../hooks/useAdminRevenue';
import { AdminRevenuePage } from '../../pages/admin/AdminRevenuePage';

// Mock recharts ResponsiveContainer to avoid SVG measurement errors in jsdom
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div style={{ width: 800, height: 320 }}>{children}</div>,
  };
});

describe('AdminRevenuePage Component', () => {
  it('hiển thị đầy đủ 5 KPI cards, biểu đồ doanh thu, bảng giảng viên, top khóa học, danh mục và tăng trưởng người dùng', () => {
    vi.spyOn(AdminRevenueHooks, 'useAdminRevenueOverview').mockReturnValue({
      data: {
        totalGrossRevenue: 15000000,
        totalPlatformCommission: 3000000,
        totalInstructorPayout: 12000000,
        totalOrdersCount: 30,
        totalStudentsCount: 22,
        platformCommissionRate: 0.20,
      },
      isLoading: false,
    });

    vi.spyOn(AdminRevenueHooks, 'useAdminRevenueChart').mockReturnValue({
      data: [
        { period: '2026-01', grossRevenue: 5000000, platformCommission: 1000000, instructorPayout: 4000000, ordersCount: 10 },
        { period: '2026-02', grossRevenue: 10000000, platformCommission: 2000000, instructorPayout: 8000000, ordersCount: 20 },
      ],
      isLoading: false,
    });

    vi.spyOn(AdminRevenueHooks, 'useInstructorRanking').mockReturnValue({
      data: [
        {
          instructorId: 2,
          instructorName: 'TS. Nguyễn Văn A',
          avatarUrl: 'https://example.com/avatar.jpg',
          totalRevenue: 9600000,
          coursesSoldCount: 24,
        },
      ],
      isLoading: false,
    });

    vi.spyOn(AdminRevenueHooks, 'useTopCourses').mockReturnValue({
      data: [
        {
          courseId: 101,
          title: 'Lập trình Fullstack Spring Boot & React',
          thumbnailUrl: 'https://example.com/course.jpg',
          instructorName: 'TS. Nguyễn Văn A',
          totalSold: 18,
          totalRevenue: 9000000,
        },
      ],
      isLoading: false,
    });

    vi.spyOn(AdminRevenueHooks, 'useCategoryRevenue').mockReturnValue({
      data: [
        {
          categoryId: 1,
          categoryName: 'Lập trình Web',
          totalRevenue: 11000000,
        },
        {
          categoryId: 2,
          categoryName: 'Trí tuệ nhân tạo',
          totalRevenue: 3500000,
        },
      ],
      isLoading: false,
    });

    vi.spyOn(AdminRevenueHooks, 'useUserGrowth').mockReturnValue({
      data: [
        { period: '2026-01', newStudentsCount: 12 },
        { period: '2026-02', newStudentsCount: 10 },
      ],
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <AdminRevenuePage />
      </MemoryRouter>
    );

    // 1. Kiểm tra 5 KPI cards
    expect(screen.getAllByText('Doanh thu gộp').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('15.000.000₫')).toBeInTheDocument();

    expect(screen.getByText('Hoa hồng sàn')).toBeInTheDocument();
    expect(screen.getByText('3.000.000₫')).toBeInTheDocument();

    expect(screen.getByText('Chi trả Giảng viên')).toBeInTheDocument();
    expect(screen.getByText('12.000.000₫')).toBeInTheDocument();

    expect(screen.getByText('Tổng đơn hàng')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();

    expect(screen.getByText('Học viên mua hàng')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();

    // 2. Kiểm tra Bảng xếp hạng giảng viên
    expect(screen.getAllByText('TS. Nguyễn Văn A').length).toBe(2);
    expect(screen.getByText('9.600.000₫')).toBeInTheDocument();
    expect(screen.getByText('24 lượt')).toBeInTheDocument();

    // 3. Kiểm tra Top khóa học bán chạy
    expect(screen.getByText('Lập trình Fullstack Spring Boot & React')).toBeInTheDocument();
    expect(screen.getByText('9.000.000₫')).toBeInTheDocument();
    expect(screen.getByText('18 lượt mua')).toBeInTheDocument();

    // 4. Kiểm tra Cơ cấu doanh thu theo danh mục
    expect(screen.getByText('Lập trình Web')).toBeInTheDocument();
    expect(screen.getByText('Trí tuệ nhân tạo')).toBeInTheDocument();

    // 5. Kiểm tra Tiêu đề biểu đồ tăng trưởng
    expect(screen.getByText('Tăng trưởng Học viên Mới')).toBeInTheDocument();
  });
});
