import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useCheckout } from '../../hooks/useOrders';
import { formatCurrency } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUrl';
import { useToast } from '../../context/ToastContext';

// Cấu hình VietQR
const VIETQR_BANK_BIN = (import.meta.env.VITE_VIETQR_BANK_BIN || '970415').trim();
const VIETQR_ACCOUNT_NO = (import.meta.env.VITE_VIETQR_ACCOUNT_NO || '113366668888').trim();
const VIETQR_ACCOUNT_NAME = (import.meta.env.VITE_VIETQR_ACCOUNT_NAME || 'QUY VAC XIN PHONG CHONG COVID').trim();
const VIETQR_TEMPLATE = (import.meta.env.VITE_VIETQR_TEMPLATE || 'compact2').trim();

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { data: cart = { items: [], totalPrice: 0, totalItems: 0 }, isLoading } = useCart();
  const checkoutMutation = useCheckout();
  const { showToast } = useToast();

  const [qrImageError, setQrImageError] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Mã dự thảo đơn hàng dùng cho nội dung chuyển khoản
  const [orderDraftCode] = useState(() => 'DH' + Math.floor(100000 + Math.random() * 900000));

  const items = cart.items || [];
  const isEmpty = items.length === 0;

  // Nội dung chuyển khoản theo mã đơn và khóa học
  const firstCourseTitle = items[0]?.courseTitle || '';
  const cleanTitle = firstCourseTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .slice(0, 15);
  const transferContent = `${orderDraftCode} ${cleanTitle}`.trim();

  // URL ảnh VietQR
  const vietQrUrl = `https://img.vietqr.io/image/${VIETQR_BANK_BIN}-${VIETQR_ACCOUNT_NO}-${VIETQR_TEMPLATE}.png?amount=${Math.round(cart.totalPrice || 0)}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(VIETQR_ACCOUNT_NAME)}`;

  // Xử lý hoàn tất thanh toán
  const handlePaymentSubmit = async () => {
    if (checkoutMutation.isPending) return;
    setCheckoutError('');

    try {
      const res = await checkoutMutation.mutateAsync({ paymentMethod: 'QR_CODE' });
      const order = res.data;
      showToast('Thanh toán thành công!', 'success');
      navigate('/orders/success', { state: { order } });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Thanh toán không thành công. Vui lòng thử lại sau.';
      setCheckoutError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9FC] flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#16324F] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-[#5E5E5E]">Đang chuẩn bị trang thanh toán...</p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-[#FAF9FC] flex items-center justify-center p-6 text-[#1A1C1E]">
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-10 text-center max-w-md w-full shadow-xs space-y-5">
          <div className="w-16 h-16 bg-[#F4F3F6] rounded-full flex items-center justify-center mx-auto text-[#5E5E5E]">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-serif text-[#001D37]">Giỏ hàng của bạn đang trống</h2>
            <p className="text-xs text-[#5E5E5E]">Khám phá khóa học để bắt đầu.</p>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="w-full py-3 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Khám phá khóa học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9FC] pb-24 text-[#1A1C1E]">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#001D37] via-[#16324F] to-[#0A2540] text-white py-10 relative overflow-hidden shadow-md">
        <div className="max-w-[1280px] mx-auto px-6 relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-xs text-blue-200/80">
            <Link to="/cart" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại giỏ hàng</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-300 font-bold">Thanh toán</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <QrCode className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-serif">Thanh toán</h1>
              <p className="text-xs text-blue-100/70 mt-0.5">
                Chuyển khoản bằng mã VietQR để hoàn tất đăng ký khóa học
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-[1280px] mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: VietQR Payment Flow */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#E4E4E0] pb-4">
                <h2 className="font-serif font-bold text-lg text-[#001D37] flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span>Chuyển khoản qua mã QR</span>
                </h2>
                <p className="text-xs text-[#5E5E5E] mt-1">
                  Quét mã bằng ứng dụng ngân hàng để chuyển khoản, sau đó bấm &apos;Tôi đã thanh toán&apos;.
                </p>
              </div>

              {/* QR Display Card */}
              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#FAF9FC] to-white border border-[#E4E4E0] rounded-2xl space-y-4">
                {/* QR Box with Fallback */}
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#E4E4E0] min-w-[240px] min-h-[240px] flex items-center justify-center">
                  {qrImageError ? (
                    <div className="flex flex-col items-center justify-center text-center p-5 space-y-3 max-w-[260px]">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-xs text-[#001D37]">Không tải được mã QR</p>
                        <p className="text-[10px] text-[#5E5E5E] leading-relaxed">
                          Bạn vẫn có thể bấm nút &quot;Tôi đã thanh toán&quot; bên dưới để hoàn tất đơn hàng.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQrImageError(false)}
                        className="px-3.5 py-1.5 bg-[#16324F] hover:bg-[#001D37] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Thử tải lại</span>
                      </button>
                    </div>
                  ) : (
                    <img
                      src={vietQrUrl}
                      alt="Mã QR thanh toán VietQR"
                      onError={() => setQrImageError(true)}
                      className="w-[280px] max-w-full h-auto object-contain rounded-xl shadow-xs border border-[#E4E4E0]"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Price & Transfer Content info */}
                <div className="text-center space-y-1">
                  <p className="text-[11px] font-semibold text-[#5E5E5E] uppercase tracking-wider">
                    Số tiền thanh toán
                  </p>
                  <p className="text-2xl font-serif font-extrabold text-emerald-700">
                    {formatCurrency(cart.totalPrice)}
                  </p>
                  <p className="text-xs text-[#5E5E5E]">
                    Nội dung chuyển khoản: <strong className="font-mono text-[#001D37] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{transferContent}</strong>
                  </p>
                </div>

                {/* Action button & Disclaimer */}
                <div className="w-full max-w-sm space-y-3 pt-2">
                  <p className="text-[11px] text-[#5E5E5E] text-center">
                    Đây là bản minh họa, không phát sinh giao dịch thật.
                  </p>

                  {checkoutError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePaymentSubmit}
                    disabled={checkoutMutation.isPending}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {checkoutMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Đang xử lý đơn hàng...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Tôi đã thanh toán</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Assurance Notice */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-[#16324F]">
                <ShieldCheck className="w-5 h-5 text-[#16324F] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Chính sách học tập tại EduMOOC:</p>
                  <p className="leading-relaxed mt-0.5 text-[#5E5E5E]">
                    Khóa học được kích hoạt tự động ngay sau khi xác nhận thanh toán. Bạn được quyền truy cập trọn đời tài liệu bài giảng và nhận chứng chỉ khi hoàn thành khóa học.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs space-y-6 sticky top-24">
            <h3 className="font-serif font-extrabold text-base text-[#001D37] border-b border-[#E4E4E0] pb-3">
              Tóm tắt đơn hàng ({items.length} khóa học)
            </h3>

            {/* Course List Preview */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FAF9FC] border border-[#E4E4E0]">
                  <img
                    src={getImageUrl(item.thumbnailUrl) || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300'}
                    alt={item.courseTitle}
                    className="w-14 h-10 object-cover rounded-md shrink-0 border border-[#E4E4E0]"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-[#001D37] truncate">{item.courseTitle}</p>
                    <p className="text-[11px] text-[#5E5E5E]">{item.instructorName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-xs text-[#001D37]">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs pt-3 border-t border-[#E4E4E0]">
              <div className="flex items-center justify-between text-[#5E5E5E]">
                <span>Tạm tính:</span>
                <span className="font-medium text-[#1A1C1E]">{formatCurrency(cart.totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-[#5E5E5E]">
                <span>Hình thức thanh toán:</span>
                <span className="font-bold text-[#16324F]">
                  Chuyển khoản QR
                </span>
              </div>

              <div className="pt-3 border-t border-[#E4E4E0] flex items-baseline justify-between">
                <span className="text-sm font-bold text-[#001D37]">Tổng thanh toán:</span>
                <div className="text-right">
                  <span className="text-2xl font-bold font-serif text-emerald-700">
                    {formatCurrency(cart.totalPrice)}
                  </span>
                  <p className="text-[10px] text-[#5E5E5E]">Đã bao gồm quyền truy cập khóa học</p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="space-y-2 pt-2 border-t border-[#E4E4E0] text-[11px] text-[#5E5E5E]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kích hoạt khóa học ngay sau khi hoàn tất</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Hỗ trợ giải đáp từ đội ngũ giảng viên</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
