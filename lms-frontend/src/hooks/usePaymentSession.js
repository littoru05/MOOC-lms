import { useQuery, useMutation } from '@tanstack/react-query';
import { paymentSessionApi } from '../api/paymentSessionApi';

/**
 * Hook kiểm tra trạng thái phiên thanh toán định kỳ mỗi 2 giây
 */
export function usePaymentSessionStatus(sessionToken, enabled = true) {
  return useQuery({
    queryKey: ['payment-session', sessionToken],
    queryFn: async () => {
      if (!sessionToken) return null;
      const res = await paymentSessionApi.getSessionStatus(sessionToken);
      return res.data;
    },
    enabled: Boolean(sessionToken) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Dừng polling nếu đã CONFIRMED hoặc EXPIRED
      if (status === 'CONFIRMED' || status === 'EXPIRED') {
        return false;
      }
      return typeof process !== 'undefined' && process.env?.NODE_ENV === 'test' ? 200 : 2000;
    },
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook xác nhận phiên thanh toán (dành cho mobile)
 */
export function useConfirmPaymentSession() {
  return useMutation({
    mutationFn: (token) => paymentSessionApi.confirmSession(token),
  });
}
