import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';

/**
 * 1. Query lấy dữ liệu giỏ hàng của học viên
 */
export function useCart() {
  const { token, isStudent } = useAuth();

  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      try {
        const res = await cartApi.getCart();
        return res.data || { items: [], totalPrice: 0, totalItems: 0 };
      } catch (err) {
        console.warn('Lỗi khi tải giỏ hàng:', err);
        return { items: [], totalPrice: 0, totalItems: 0 };
      }
    },
    enabled: Boolean(token) && isStudent,
    staleTime: 60 * 1000, // 1 phút
  });
}

/**
 * 2. Mutation thêm khóa học vào giỏ hàng
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId) => cartApi.addToCart(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/**
 * 3. Mutation xóa khóa học khỏi giỏ hàng
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId) => cartApi.removeFromCart(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
