import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { ExplorePage } from '../../pages/student/ExplorePage';

const renderExplorePage = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ExplorePage />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('ExplorePage Component with MSW', () => {
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
});
