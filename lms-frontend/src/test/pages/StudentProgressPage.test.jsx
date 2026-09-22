import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { StudentProgressPage } from '../../pages/instructor/StudentProgressPage';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

const renderStudentProgressPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <StudentProgressPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('StudentProgressPage Component with Real TanStack Query', () => {
  it('tải và hiển thị danh sách học viên thật từ API', async () => {
    renderStudentProgressPage();

    expect(screen.getByText(/Tiến độ & Kết quả Học viên/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Trần Văn Học Viên/i)).toBeInTheDocument();
      expect(screen.getByText(/student@lms.com/i)).toBeInTheDocument();
    });
  });

  it('hiển thị đầy đủ các thẻ KPI tổng quan', async () => {
    renderStudentProgressPage();

    expect(screen.getByText(/Tổng học viên/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã tốt nghiệp/i)).toBeInTheDocument();
    expect(screen.getByText(/Đang học/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiến độ trung bình/i)).toBeInTheDocument();
  });
});
