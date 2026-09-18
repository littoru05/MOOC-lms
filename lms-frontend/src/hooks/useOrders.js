import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import { cartApi } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';

/**
 * 1. Query lấy danh sách lịch sử đơn hàng của học viên
 */
export function useOrderHistory() {
  const { token, isStudent } = useAuth();

  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        const res = await orderApi.getMyOrders();
        return res.data || [];
      } catch (err) {
        console.warn('Lỗi khi tải lịch sử đơn hàng:', err);
        return [];
      }
    },
    enabled: Boolean(token) && isStudent,
    staleTime: 60 * 1000,
  });
}

/**
 * 2. Query lấy chi tiết một đơn hàng theo ID
 */
export function useOrderDetail(orderId) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      const res = await orderApi.getOrderById(orderId);
      return res.data;
    },
    enabled: Boolean(token) && Boolean(orderId),
  });
}

/**
 * 3. Mutation Checkout - Thanh toán giỏ hàng
 */
export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => cartApi.checkout(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-learning'] });
      return data;
    },
  });
}
