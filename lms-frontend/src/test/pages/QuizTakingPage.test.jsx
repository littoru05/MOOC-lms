import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes, createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { QuizIntroPage } from '../../pages/student/QuizIntroPage';
import { QuizTakingPage } from '../../pages/student/QuizTakingPage';
import { QuizResultPage } from '../../pages/student/QuizResultPage';

const renderWithRouter = (router) => {
  return render(
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  );
};

describe('QuizTakingPage Component with MSW', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('tải và hiển thị đề thi trắc nghiệm, các câu hỏi và lựa chọn', async () => {
    render(
      <MemoryRouter initialEntries={['/quiz/1/take?enrollmentId=100']}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/quiz/:quizId/take" element={<QuizTakingPage />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

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

    render(
      <MemoryRouter initialEntries={['/quiz/1/take?enrollmentId=100']}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/quiz/:quizId/take" element={<QuizTakingPage onCompleteQuiz={handleComplete} />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('8080')).toBeInTheDocument();
    });

    // Chọn đáp án câu 1
    const ans1 = screen.getByText('8080');
    await user.click(ans1);

    // Chọn đáp án câu 2
    const ans2 = screen.getByText(/Cú pháp mở rộng JavaScript/i);
    await user.click(ans2);

    // Bấm Nộp bài thi -> Hiện modal xác nhận trên màn hình
    const submitBtn = screen.getByRole('button', { name: /Hoàn tất & Nộp bài kiểm tra/i });
    await user.click(submitBtn);

    // Bấm xác nhận nộp bài trong modal
    const confirmSubmitBtn = screen.getByRole('button', { name: /Xác nhận nộp bài/i });
    await user.click(confirmSubmitBtn);

    await waitFor(() => {
      expect(handleComplete).toHaveBeenCalled();
    });
  });

  // (c) Bấm Back giữa lúc làm bài thì có hộp xác nhận
  it('(c) bấm Back giữa lúc làm bài thì hiện hộp thoại xác nhận rời khỏi bài thi trên màn hình', async () => {
    render(
      <MemoryRouter initialEntries={['/quiz/1/take?enrollmentId=100']}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/quiz/:quizId/take" element={<QuizTakingPage />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Bài thi tổng kết kiến thức/i)).toBeInTheDocument();
    });

    const backBtn = screen.getByRole('button', { name: 'Quay lại bài học' });
    fireEvent.click(backBtn);

    // Modal xác nhận rời khỏi bài thi xuất hiện trên màn hình
    expect(screen.getByText('Rời khỏi bài thi?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ở lại làm tiếp' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rời khỏi bài thi' })).toBeInTheDocument();
  });

  // (e) Đã đạt thì vào lại Take bị chuyển sang Result
  it('(e) đã đạt thì vào lại Take bị chuyển sang Result', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/quiz/:quizId/take',
          element: <QuizTakingPage />,
        },
        {
          path: '/quiz/:quizId/result',
          element: <QuizResultPage />,
        },
      ],
      {
        initialEntries: ['/quiz/1/take?enrollmentId=passed-enrollment'],
        initialIndex: 0,
      }
    );

    renderWithRouter(router);

    // Tự động redirect sang Result vì enrollmentId này đã có chứng chỉ (đã đạt)
    await waitFor(() => {
      expect(screen.getByText(/Chúc mừng bạn đã vượt qua bài kiểm tra!/i)).toBeInTheDocument();
      expect(screen.getByText('CERT-12345')).toBeInTheDocument();
    });
  });

  // (a) Làm xong và bấm Back thì không rơi vào màn hình làm bài
  it('(a) làm xong và bấm Back thì không rơi vào màn hình làm bài', async () => {
    const user = userEvent.setup();

    const router = createMemoryRouter(
      [
        {
          path: '/learn/:courseId',
          element: <div>Phòng học Course Player</div>,
        },
        {
          path: '/quiz/:quizId/take',
          element: <QuizTakingPage />,
        },
        {
          path: '/quiz/:quizId/result',
          element: <QuizResultPage />,
        },
      ],
      {
        initialEntries: ['/learn/1', '/quiz/1/take?enrollmentId=100'],
        initialIndex: 1,
      }
    );

    renderWithRouter(router);

    await waitFor(() => {
      expect(screen.getByText('8080')).toBeInTheDocument();
    });

    // Chọn đáp án
    await user.click(screen.getByText('8080'));
    await user.click(screen.getByText(/Cú pháp mở rộng JavaScript/i));

    // Nộp bài -> Hiện modal xác nhận -> Bấm xác nhận
    const submitBtn = screen.getByRole('button', { name: /Hoàn tất & Nộp bài kiểm tra/i });
    await user.click(submitBtn);

    const confirmSubmitBtn = screen.getByRole('button', { name: /Xác nhận nộp bài/i });
    await user.click(confirmSubmitBtn);

    // Đã chuyển sang trang kết quả bằng replace
    await waitFor(() => {
      expect(screen.getByText(/Chúc mừng bạn đã vượt qua bài kiểm tra!/i)).toBeInTheDocument();
    });

    // Bấm nút Back của trình duyệt
    await act(async () => {
      await router.navigate(-1);
    });

    // Quay lại Course Player, KHÔNG rơi vào màn hình làm bài QuizTakingPage
    await waitFor(() => {
      expect(screen.getByText('Phòng học Course Player')).toBeInTheDocument();
      expect(screen.queryByText(/Spring Boot sử dụng cổng mặc định nào/i)).not.toBeInTheDocument();
    });
  });

  // (b) F5 trang kết quả: phục hồi từ API nếu có chứng chỉ hoặc hiện thông báo thân thiện (không crash)
  it('(b) F5 trang kết quả phục hồi thành công từ API khi có chứng chỉ', async () => {
    render(
      <MemoryRouter initialEntries={['/quiz/1/result?enrollmentId=passed-enrollment']}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/quiz/:quizId/result" element={<QuizResultPage />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Chúc mừng bạn đã vượt qua bài kiểm tra!/i)).toBeInTheDocument();
      expect(screen.getByText('CERT-12345')).toBeInTheDocument();
    });
  });

  it('(b) F5 trang kết quả khi không tìm thấy kết quả thì hiện thông báo thân thiện, không crash', async () => {
    render(
      <MemoryRouter initialEntries={['/quiz/1/result?enrollmentId=failed-enrollment']}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/quiz/:quizId/result" element={<QuizResultPage />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Không tìm thấy kết quả\. Quay lại bài học để làm bài thi\./i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Quay lại bài học/i })).toBeInTheDocument();
    });
  });

  // (d) Nút "trở lại" ở Intro và Result đều về đúng /learn/:courseId
  it('(d) nút "trở lại" ở QuizIntroPage và QuizResultPage đều về đúng /learn/:courseId', async () => {
    // 1. Kiểm tra QuizIntroPage
    const introRouter = createMemoryRouter(
      [
        {
          path: '/learn/:courseId',
          element: <div>Trang Course Player ID 1</div>,
        },
        {
          path: '/quiz/:quizId',
          element: <QuizIntroPage />,
        },
      ],
      {
        initialEntries: ['/quiz/1'],
        initialIndex: 0,
      }
    );

    const { unmount } = renderWithRouter(introRouter);

    await waitFor(() => {
      expect(screen.getByText(/Hệ thống Khảo thí Đánh giá Năng lực/i)).toBeInTheDocument();
    });

    const introBackBtn = screen.getByRole('button', { name: /Quay lại bài học/i });
    fireEvent.click(introBackBtn);

    await waitFor(() => {
      expect(screen.getByText('Trang Course Player ID 1')).toBeInTheDocument();
    });

    unmount();

    // 2. Kiểm tra QuizResultPage
    const resultRouter = createMemoryRouter(
      [
        {
          path: '/learn/:courseId',
          element: <div>Trang Course Player ID 1</div>,
        },
        {
          path: '/quiz/:quizId/result',
          element: <QuizResultPage />,
        },
      ],
      {
        initialEntries: [
          {
            pathname: '/quiz/1/result',
            state: {
              result: {
                passed: true,
                score: 100,
                passingScore: 80,
                courseId: 1,
              },
            },
          },
        ],
        initialIndex: 0,
      }
    );

    renderWithRouter(resultRouter);

    await waitFor(() => {
      expect(screen.getByText(/Quay về bài học/i)).toBeInTheDocument();
    });

    const resultBackBtn = screen.getByRole('button', { name: /Quay về bài học/i });
    fireEvent.click(resultBackBtn);

    await waitFor(() => {
      expect(screen.getByText('Trang Course Player ID 1')).toBeInTheDocument();
    });
  });
  it('học viên nộp bài khi chưa chọn câu trả lời nào: hiển thị thẻ xác nhận trên màn hình, nộp bài thành công với điểm 0', async () => {
    const user = userEvent.setup();

    const router = createMemoryRouter(
      [
        {
          path: '/quiz/:quizId/take',
          element: <QuizTakingPage />,
        },
        {
          path: '/quiz/:quizId/result',
          element: <QuizResultPage />,
        },
      ],
      {
        initialEntries: ['/quiz/1/take?enrollmentId=100'],
        initialIndex: 0,
      }
    );

    renderWithRouter(router);

    await waitFor(() => {
      expect(screen.getByText('8080')).toBeInTheDocument();
    });

    // Bấm Nộp bài thi ngay khi chưa chọn câu trả lời nào
    const submitBtn = screen.getByRole('button', { name: /Hoàn tất & Nộp bài kiểm tra/i });
    await user.click(submitBtn);


    // Kiểm tra ô modal xác nhận xuất hiện trực tiếp trên màn hình
    expect(screen.getByText('Xác nhận nộp bài thi')).toBeInTheDocument();
    expect(screen.getByText(/chưa chọn bất kỳ câu trả lời nào/i)).toBeInTheDocument();

    // Bấm nút "Xác nhận nộp bài" trong modal
    const confirmBtn = screen.getByRole('button', { name: /Xác nhận nộp bài/i });
    await user.click(confirmBtn);

    // Chuyển sang màn hình kết quả thông báo trượt (0 điểm)
    await waitFor(() => {
      expect(screen.getByText(/Rất tiếc, bạn chưa đạt điểm yêu cầu!/i)).toBeInTheDocument();
      expect(screen.getByText(/0 \/ 100/i)).toBeInTheDocument();
    });
  });

  it('học viên hủy nộp bài tại modal xác nhận thì vẫn ở lại màn hình làm bài', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/quiz/1/take?enrollmentId=100']}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/quiz/:quizId/take" element={<QuizTakingPage />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('8080')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /Hoàn tất & Nộp bài kiểm tra/i });
    await user.click(submitBtn);

    // Modal xuất hiện
    expect(screen.getByText('Xác nhận nộp bài thi')).toBeInTheDocument();

    // Bấm nút "Tiếp tục làm bài"
    const cancelBtn = screen.getByRole('button', { name: /Tiếp tục làm bài/i });
    await user.click(cancelBtn);

    // Vẫn ở lại màn hình làm bài
    expect(screen.getByText(/Bài thi tổng kết kiến thức/i)).toBeInTheDocument();
    expect(screen.getByText('8080')).toBeInTheDocument();
  });
});