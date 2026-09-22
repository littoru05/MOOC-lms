import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from '../../components/common/Pagination';

describe('Pagination Component', () => {
  it('không render gì khi totalItems = 0', () => {
    const { container } = render(
      <Pagination currentPage={1} totalItems={0} pageSize={5} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('hiển thị thông tin mục khi totalItems <= pageSize nhưng ẩn nút điều hướng', () => {
    render(
      <Pagination currentPage={1} totalItems={4} pageSize={5} onPageChange={vi.fn()} />
    );
    expect(screen.getByText(/Hiển thị/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getAllByText('4').length).toBe(2);
    expect(screen.queryByText('Trước')).not.toBeInTheDocument();
    expect(screen.queryByText('Sau')).not.toBeInTheDocument();
  });

  it('hiển thị đầy đủ số trang, nút Trước/Sau và xử lý bấm chuyển trang', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        totalItems={14}
        pageSize={5}
        onPageChange={onPageChange}
      />
    );

    // Hiển thị 6 - 10 trong tổng số 14 mục
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();

    // Nút trang 1, 2, 3
    const page1Btn = screen.getByRole('button', { name: '1' });
    const page3Btn = screen.getByRole('button', { name: '3' });
    expect(page1Btn).toBeInTheDocument();
    expect(page3Btn).toBeInTheDocument();

    // Click nút trang 3
    fireEvent.click(page3Btn);
    expect(onPageChange).toHaveBeenCalledWith(3);

    // Click nút Trước (từ trang 2 về trang 1)
    const prevBtn = screen.getByRole('button', { name: /Trước/i });
    fireEvent.click(prevBtn);
    expect(onPageChange).toHaveBeenCalledWith(1);

    // Click nút Sau (từ trang 2 sang trang 3)
    const nextBtn = screen.getByRole('button', { name: /Sau/i });
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disable nút Trước khi ở trang 1 và disable nút Sau khi ở trang cuối', () => {
    const { rerender } = render(
      <Pagination currentPage={1} totalItems={15} pageSize={5} onPageChange={vi.fn()} />
    );

    const prevBtn = screen.getByRole('button', { name: /Trước/i });
    expect(prevBtn).toBeDisabled();

    rerender(
      <Pagination currentPage={3} totalItems={15} pageSize={5} onPageChange={vi.fn()} />
    );

    const nextBtn = screen.getByRole('button', { name: /Sau/i });
    expect(nextBtn).toBeDisabled();
  });
});
