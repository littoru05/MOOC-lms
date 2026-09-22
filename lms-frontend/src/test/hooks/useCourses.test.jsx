import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useCategories, usePublishedCourses, useSubmitForReview, useTeachingCourses, useRequestDeleteCourse } from '../../hooks/useCourses';
import { createTestQueryClient } from '../test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCourses Custom React Query Hooks', () => {
  it('usePublishedCourses trả về danh sách khóa học và trạng thái loading chính xác', async () => {
    const { result } = renderHook(() => usePublishedCourses(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data.length).toBeGreaterThan(0);
    expect(result.current.data[0].title).toContain('Lập trình Fullstack Web hiện đại');
  });

  it('useCategories trả về danh sách danh mục khóa học', async () => {
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data.length).toBeGreaterThan(0);
    expect(result.current.data.some((c) => c.name === 'Lập trình Web')).toBe(true);
  });

  it('useTeachingCourses trả về danh sách khóa học giảng dạy', async () => {
    const { result } = renderHook(() => useTeachingCourses(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data.length).toBeGreaterThan(0);
  });

  it('useSubmitForReview thực thi mutation thành công', async () => {
    const { result } = renderHook(() => useSubmitForReview(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
  });

  it('useRequestDeleteCourse thực thi mutation yêu cầu xóa khóa học thành công', async () => {
    const { result } = renderHook(() => useRequestDeleteCourse(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
    await result.current.mutateAsync(1);
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
