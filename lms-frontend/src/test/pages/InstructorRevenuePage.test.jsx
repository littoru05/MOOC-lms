import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import * as RevenueHooks from '../../hooks/useInstructorRevenue';
import { InstructorRevenuePage } from '../../pages/instructor/InstructorRevenuePage';

// Mock recharts ResponsiveContainer to avoid SVG measurement errors in jsdom
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div style={{ width: 800, height: 320 }}>{children}</div>,
  };
});

describe('InstructorRevenuePage Component', () => {
  it('hiển thị đầy đủ thông tin KPI thu nhập, biểu đồ và bảng khóa học', () => {
    vi.spyOn(RevenueHooks, 'useRevenueSummary').mockReturnValue({
      data: {
        totalCoursesSold: 12,
        totalNetRevenue: 9600000,
        totalStudentsCount: 9,
        platformCommissionRate: 0.20,
      },
      isLoading: false,
    });

    vi.spyOn(RevenueHooks, 'useRevenueChart').mockReturnValue({
      data: [
        { period: '01/2026', ordersCount: 5, netRevenue: 4000000 },
        { period: '02/2026', ordersCount: 7, netRevenue: 5600000 },
      ],
      isLoading: false,
    });

    vi.spyOn(RevenueHooks, 'useRevenueByCourse').mockReturnValue({
      data: [
        {
          courseId: 101,
          courseTitle: 'Khóa học Spring Boot Nâng Cao',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          coursePrice: 1000000,
          totalSold: 8,
          netRevenue: 6400000,
        },
      ],
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <InstructorRevenuePage />
      </MemoryRouter>
    );

    // Kiểm tra KPI cards
    expect(screen.getByText('Khóa học đã bán')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    expect(screen.getAllByText('Thu nhập của bạn').length).toBe(3);
    expect(screen.getByText('9.600.000₫')).toBeInTheDocument();

    expect(screen.getByText('Học viên đã mua')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();

    // Kiểm tra bảng chi tiết thu nhập theo khóa học
    expect(screen.getByText('Khóa học Spring Boot Nâng Cao')).toBeInTheDocument();
    expect(screen.getByText('6.400.000₫')).toBeInTheDocument();

    // Xác nhận không có chữ "Doanh thu gộp" trên trang
    expect(screen.queryByText('Doanh thu gộp')).not.toBeInTheDocument();
  });

  it('hiển thị trạng thái Empty State khi chưa có dữ liệu khóa học', () => {
    vi.spyOn(RevenueHooks, 'useRevenueSummary').mockReturnValue({
      data: {
        totalCoursesSold: 0,
        totalNetRevenue: 0,
        totalStudentsCount: 0,
        platformCommissionRate: 0.20,
      },
      isLoading: false,
    });

    vi.spyOn(RevenueHooks, 'useRevenueChart').mockReturnValue({
      data: null,
      isLoading: false,
    });

    vi.spyOn(RevenueHooks, 'useRevenueByCourse').mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <InstructorRevenuePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Chưa có dữ liệu khóa học nào')).toBeInTheDocument();
    expect(screen.getByText('Chưa có dữ liệu thu nhập trong khoảng thời gian này')).toBeInTheDocument();
  });
});
