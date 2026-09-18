import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Smartphone, 
  Loader2,
  RefreshCw,
  WifiOff
} from 'lucide-react';
import { usePaymentSessionStatus, useConfirmPaymentSession } from '../../hooks/usePaymentSession';

export const ConfirmPaymentPage = () => {
  const { token } = useParams();
  const { data: sessionData, isLoading, error: queryError, refetch } = usePaymentSessionStatus(token, true);
  const confirmMutation = useConfirmPaymentSession();

  const [isConfirmedLocal, setIsConfirmedLocal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const hasConfirmedRef = useRef(false);

  const isConfirmed = isConfirmedLocal || sessionData?.status === 'CONFIRMED';
  const isExpired = sessionData?.status === 'EXPIRED';

  // Tự động gọi API confirm ngay khi trang load (chống trùng lặp bằng useRef)
  useEffect(() => {
    if (!token || hasConfirmedRef.current) return;
    if (isLoading) return;

    if (sessionData?.status === 'CONFIRMED') {
      setIsConfirmedLocal(true);
      return;
    }
    if (sessionData?.status === 'EXPIRED') {
      return;
    }

    const autoConfirm = async () => {
      hasConfirmedRef.current = true;
      setErrorMessage('');
      try {
        await confirmMutation.mutateAsync(token);
        setIsConfirmedLocal(true);
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Xác nhận thanh toán thất bại!';
        setErrorMessage(msg);
      }
    };

    autoConfirm();
  }, [token, isLoading, sessionData?.status]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9FC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-[#16324F] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-[#5E5E5E]">Đang tải thông tin phiên thanh toán...</p>
      </div>
    );
  }

  const isNetworkError = Boolean(
    queryError && (!queryError.response || queryError.code === 'ERR_NETWORK' || queryError.message?.includes('Network Error'))
  );

  if (queryError || (!isLoading && !sessionData && !token)) {
    return (
      <div className="min-h-screen bg-[#FAF9FC] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            {isNetworkError ? <WifiOff className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-bold font-serif text-[#001D37]">
              {isNetworkError ? 'Không thể kết nối máy chủ' : 'Phiên thanh toán không hợp lệ'}
            </h1>
            <p className="text-xs text-[#5E5E5E]">
              {isNetworkError
                ? 'Không thể kết nối tới máy chủ, vui lòng kiểm tra kết nối mạng hoặc thử lại sau.'
                : 'Mã phiên không tồn tại hoặc đã bị hủy. Vui lòng quét lại mã QR mới trên màn hình máy tính.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="w-full py-3 bg-[#16324F] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Thử lại</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF9FC] to-[#EFF2F6] flex flex-col items-center justify-center p-4 sm:p-6 text-[#1A1C1E]">
      <div className="max-w-sm w-full bg-white border border-[#E4E4E0] rounded-3xl p-6 sm:p-8 shadow-md space-y-6 text-center">
        
        {/* Header Icon */}
        <div className="flex justify-center">
          {isConfirmed ? (
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          ) : isExpired ? (
            <div className="w-16 h-16 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-blue-50 text-[#16324F] border border-blue-200 rounded-2xl flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#16324F]" />
            </div>
          )}
        </div>

        {/* Status Texts */}
        <div className="space-y-2">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Thanh toán QR tự động
          </span>
          <h1 className="text-xl font-bold font-serif text-[#001D37]">
            {isConfirmed
              ? 'Xác nhận thành công!'
              : isExpired
              ? 'Mã QR đã hết hạn'
              : 'Đang xác nhận thanh toán...'}
          </h1>
          <p className="text-xs text-[#5E5E5E] leading-relaxed">
            {isConfirmed
              ? 'Đã xác nhận! Quay lại máy tính để tiếp tục.'
              : isExpired
              ? 'Phiên thanh toán đã hết hạn sau 5 phút. Vui lòng tạo mã QR mới trên máy tính.'
              : 'Đang tự động xác thực và gửi tín hiệu về máy tính của bạn...'}
          </p>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2 text-left">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Status Box */}
        {isConfirmed ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1">
            <p className="font-bold">Đã gửi tín hiệu xác nhận tới máy tính!</p>
            <p className="text-[11px] text-emerald-700">Màn hình máy tính của bạn sẽ tự động chuyển trang và kích hoạt khóa học trong giây lát.</p>
          </div>
        ) : isExpired ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
            Vui lòng nhấn "Tạo mã QR mới" trên màn hình máy tính của bạn.
          </div>
        ) : (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-[#16324F] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#16324F]" />
            <span className="font-medium">Đang xử lý kết nối an toàn...</span>
          </div>
        )}

        {/* Security badge */}
        <div className="pt-2 border-t border-[#E4E4E0] flex items-center justify-center gap-1.5 text-[11px] text-[#5E5E5E]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Giao thức kết nối an toàn một lần</span>
        </div>

      </div>
    </div>
  );
};
