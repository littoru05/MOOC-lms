import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Lock,
  ChevronRight,
  Info,
  Calendar,
  User,
  Hash,
  RefreshCw,
  Smartphone,
  Loader2
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useCheckout } from '../../hooks/useOrders';
import { usePaymentSessionStatus } from '../../hooks/usePaymentSession';
import { paymentSessionApi } from '../../api/paymentSessionApi';
import { formatCurrency } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUrl';
import { useToast } from '../../context/ToastContext';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { data: cart = { items: [], totalPrice: 0, totalItems: 0 }, isLoading } = useCart();
  const checkoutMutation = useCheckout();
  const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState('QR_CODE'); // 'QR_CODE' | 'CARD'

  // Payment Session cho QR Code Flow
  const [sessionToken, setSessionToken] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isAutoCheckingOut, setIsAutoCheckingOut] = useState(false);
  const hasTriggeredCheckoutRef = useRef(false);
  const hasInitializedSessionRef = useRef(false);

  // Status Polling từ Backend (mỗi 2 giây)
  const { 
    data: sessionData, 
    isLoading: isSessionLoading, 
    refetch: refetchSession 
  } = usePaymentSessionStatus(sessionToken, paymentMethod === 'QR_CODE' && !isAutoCheckingOut);

  const sessionStatus = sessionData?.status || 'PENDING';

  // Hàm tạo Payment Session mới
  const initPaymentSession = async () => {
    try {
      setIsCreatingSession(true);
      hasTriggeredCheckoutRef.current = false;
      const res = await paymentSessionApi.createSession();
      setSessionToken(res.data.sessionToken);
    } catch (err) {
      console.error('Lỗi khi tạo phiên thanh toán:', err);
      showToast('Không thể tạo phiên thanh toán QR, vui lòng thử lại', 'error');
      hasInitializedSessionRef.current = false;
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Khởi tạo session khi vào trang hoặc chọn tab QR (chống tạo trùng session trong React StrictMode)
  useEffect(() => {
    if (paymentMethod === 'QR_CODE' && !sessionToken && !isCreatingSession && !hasInitializedSessionRef.current) {
      hasInitializedSessionRef.current = true;
      initPaymentSession();
    }
  }, [paymentMethod, sessionToken, isCreatingSession]);

  // Tự động kích hoạt checkout khi phát hiện điện thoại đã xác nhận (status === CONFIRMED)
  useEffect(() => {
    if (sessionStatus === 'CONFIRMED' && !hasTriggeredCheckoutRef.current && !isAutoCheckingOut) {
      hasTriggeredCheckoutRef.current = true;
      executeAutoCheckout();
    }
  }, [sessionStatus, isAutoCheckingOut]);

  const executeAutoCheckout = async () => {
    try {
      setIsAutoCheckingOut(true);
      const res = await checkoutMutation.mutateAsync({ paymentMethod: 'QR_CODE' });
      const order = res.data;
      showToast('Thanh toán đơn hàng thành công qua mã QR!', 'success');
      navigate('/orders/success', { state: { order } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Thanh toán thất bại, vui lòng thử lại!';
      showToast(errorMsg, 'error');
      setIsAutoCheckingOut(false);
      hasTriggeredCheckoutRef.current = false;
    }
  };

  // Form state cho Tab Thẻ (Chỉ dùng hiển thị & validate client-side)
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [cardErrors, setCardErrors] = useState({});

  const items = cart.items || [];
  const isEmpty = items.length === 0;

  // Format số thẻ hiển thị (ví dụ: **** **** **** 1234)
  const getMaskedCardNumber = () => {
    const raw = cardData.cardNumber.replace(/\s+/g, '');
    if (!raw) return '•••• •••• •••• ••••';
    if (raw.length <= 4) return raw;
    const last4 = raw.slice(-4);
    const masked = '•••• •••• •••• ' + last4;
    return masked;
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardData((prev) => ({ ...prev, cardNumber: formatted }));
    if (cardErrors.cardNumber) {
      setCardErrors((prev) => ({ ...prev, cardNumber: '' }));
    }
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardData((prev) => ({ ...prev, expiryDate: val }));
    if (cardErrors.expiryDate) {
      setCardErrors((prev) => ({ ...prev, expiryDate: '' }));
    }
  };

  const handleCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardData((prev) => ({ ...prev, cvv: val }));
    if (cardErrors.cvv) {
      setCardErrors((prev) => ({ ...prev, cvv: '' }));
    }
  };

  const validateCardForm = () => {
    const errors = {};
    const rawNumber = cardData.cardNumber.replace(/\s+/g, '');
    if (!rawNumber || rawNumber.length < 16) {
      errors.cardNumber = 'Vui lòng nhập đủ 16 số thẻ (demo)';
    }

    if (!cardData.cardHolder.trim() || cardData.cardHolder.trim().length < 2) {
      errors.cardHolder = 'Vui lòng nhập tên chủ thẻ';
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(cardData.expiryDate)) {
      errors.expiryDate = 'Hạn dùng không hợp lệ (MM/YY)';
    }

    if (!cardData.cvv || cardData.cvv.length < 3) {
      errors.cvv = 'CVV gồm 3-4 chữ số';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProcessCardCheckout = async () => {
    const isValid = validateCardForm();
    if (!isValid) {
      showToast('Vui lòng kiểm tra lại thông tin thẻ thanh toán', 'error');
      return;
    }

    try {
      // TUYỆT ĐỐI KHÔNG gửi thông tin thẻ (số thẻ, CVV...) lên Backend
      const res = await checkoutMutation.mutateAsync({ paymentMethod: 'CARD' });
      const order = res.data;
      showToast('Thanh toán đơn hàng thành công qua Thẻ!', 'success');
      navigate('/orders/success', { state: { order } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Thanh toán thất bại, vui lòng thử lại!';
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
            <p className="text-xs text-[#5E5E5E]">Vui lòng chọn khóa học trước khi thực hiện thanh toán.</p>
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

  // URL cho mã QR quét từ điện thoại
  const publicHost = (import.meta.env.VITE_PUBLIC_HOST || import.meta.env.VITE_LAN_HOST || '').trim();
  let qrUrl = '';
  if (sessionToken) {
    if (publicHost.startsWith('http://') || publicHost.startsWith('https://')) {
      const cleanHost = publicHost.replace(/\/+$/, '');
      qrUrl = `${cleanHost}/checkout/confirm/${sessionToken}`;
    } else {
      const hostToUse = publicHost || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
      const port = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : '';
      qrUrl = `${window.location.protocol}//${hostToUse}${port}/checkout/confirm/${sessionToken}`;
    }
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
            <span className="text-amber-300 font-bold">Thanh toán đơn hàng</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <Lock className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-serif">Chọn phương thức thanh toán</h1>
              <p className="text-xs text-blue-100/70 mt-0.5">
                Mô phỏng quét mã QR trực tiếp từ điện thoại & thẻ quốc tế
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-[1280px] mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Payment Method Selection */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tabs Bar */}
            <div className="bg-white border border-[#E4E4E0] p-1.5 rounded-2xl shadow-2xs flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('QR_CODE')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'QR_CODE'
                    ? 'bg-[#16324F] text-white shadow-xs'
                    : 'bg-transparent text-[#5E5E5E] hover:text-[#1A1C1E] hover:bg-gray-100'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Quét mã QR (Khuyên dùng)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'CARD'
                    ? 'bg-[#16324F] text-white shadow-xs'
                    : 'bg-transparent text-[#5E5E5E] hover:text-[#1A1C1E] hover:bg-gray-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Thẻ Quốc tế (Demo)</span>
              </button>
            </div>

            {/* TAB CONTENT A: QR CODE (AUTO REAL-PHONE SCAN) */}
            {paymentMethod === 'QR_CODE' && (
              <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
                <div className="border-b border-[#E4E4E0] pb-4">
                  <h2 className="font-serif font-bold text-lg text-[#001D37] flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-emerald-600" />
                    <span>Quét mã QR bằng điện thoại</span>
                  </h2>
                  <p className="text-xs text-[#5E5E5E] mt-1">
                    Dùng camera hoặc app quét mã trên điện thoại (cùng mạng Wi-Fi). Máy tính sẽ tự động nhận diện và hoàn tất đơn hàng!
                  </p>
                </div>

                {/* QR Display Card */}
                <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#FAF9FC] to-white border border-[#E4E4E0] rounded-2xl space-y-4 relative overflow-hidden">
                  
                  {/* QR Box with states */}
                  <div className="relative p-4 bg-white rounded-2xl shadow-sm border border-[#E4E4E0] min-w-[212px] min-h-[212px] flex items-center justify-center">
                    {isCreatingSession ? (
                      <div className="flex flex-col items-center gap-2 p-6">
                        <div className="w-8 h-8 border-3 border-[#16324F] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[11px] font-semibold text-[#5E5E5E]">Đang tạo mã QR...</span>
                      </div>
                    ) : sessionStatus === 'EXPIRED' ? (
                      <div className="flex flex-col items-center justify-center text-center p-4 space-y-3">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs text-[#001D37]">Mã QR đã hết hạn, vui lòng tạo lại</p>
                          <p className="text-[10px] text-[#5E5E5E]">Phiên thanh toán kéo dài 5 phút</p>
                        </div>
                        <button
                          type="button"
                          onClick={initPaymentSession}
                          className="px-4 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Tạo mã QR mới</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        {qrUrl && (
                          <QRCodeSVG
                            value={qrUrl}
                            size={180}
                            level="M"
                            includeMargin={false}
                          />
                        )}

                        {/* Overlay when auto checking out */}
                        {(sessionStatus === 'CONFIRMED' || isAutoCheckingOut) && (
                          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-3 p-4 z-10 animate-fadeIn">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-emerald-700">Đã phát hiện xác nhận!</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Price info */}
                  <div className="text-center space-y-1">
                    <p className="text-[11px] font-semibold text-[#5E5E5E] uppercase tracking-wider">
                      Số tiền thanh toán
                    </p>
                    <p className="text-2xl font-serif font-extrabold text-emerald-700">
                      {formatCurrency(cart.totalPrice)}
                    </p>
                  </div>

                  {/* Status Indicator Bar */}
                  <div className="w-full max-w-sm pt-4 border-t border-[#E4E4E0] space-y-3">
                    {sessionStatus === 'CONFIRMED' || isAutoCheckingOut ? (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                        <span>Đang thực hiện thanh toán...</span>
                      </div>
                    ) : sessionStatus === 'EXPIRED' ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs font-semibold text-amber-800">
                        Phiên đã kết thúc. Hãy bấm nút tạo mã mới để tiếp tục.
                      </div>
                    ) : (
                      <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-[#16324F]">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                        </span>
                        <span>Đang chờ quét mã...</span>
                      </div>
                    )}

                    {/* Instruction steps */}
                    <div className="space-y-1.5 text-xs text-[#5E5E5E] pt-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">1</span>
                        <span>Mở Camera hoặc app quét QR trên điện thoại.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">2</span>
                        <span>Điện thoại mở liên kết và tự động xác nhận trong tích tắc.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">3</span>
                        <span>Máy tính sẽ tự động hoàn tất và kích hoạt khóa học ngay lập tức.</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center mt-2 font-medium">
                      💡 Nếu điện thoại hiện trang cảnh báo của ngrok, bấm <strong>"Visit Site"</strong> để tiếp tục.
                    </p>
                  </div>
                </div>

                {/* Public Host Warning / Info */}
                {!publicHost ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-800">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Gợi ý kiểm tra quét mã qua điện thoại:</p>
                      <p className="leading-relaxed mt-0.5">
                        Cấu hình <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">VITE_PUBLIC_HOST</code> trong <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> để quét QR từ điện thoại (IP LAN, Ngrok hoặc IP VPS).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50/60 border border-blue-200/60 rounded-xl p-3 flex items-center justify-between text-[11px] text-[#5E5E5E]">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#16324F]" />
                      <span>Host kết nối: <strong className="text-[#16324F] font-mono">{publicHost}</strong></span>
                    </div>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã sẵn sàng quét
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT B: CARD (DEMO) */}
            {paymentMethod === 'CARD' && (
              <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
                <div className="border-b border-[#E4E4E0] pb-4">
                  <h2 className="font-serif font-bold text-lg text-[#001D37] flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>Thanh toán bằng thẻ quốc tế (Mô phỏng)</span>
                  </h2>
                  <p className="text-xs text-[#5E5E5E] mt-1">
                    Nhập thông tin thẻ mẫu để trải nghiệm giao diện thanh toán trực tuyến.
                  </p>
                </div>

                {/* Virtual Card Preview */}
                <div className="bg-gradient-to-tr from-[#001D37] via-[#16324F] to-[#0A2540] text-white p-6 rounded-2xl shadow-md relative overflow-hidden space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="text-xs tracking-widest text-blue-200/80 font-mono">DEMO CARD</div>
                    <div className="text-sm font-extrabold italic tracking-wider text-amber-300 font-serif">
                      VISA / MC
                    </div>
                  </div>

                  <div className="font-mono text-lg sm:text-xl tracking-widest text-center text-white/90 py-2">
                    {getMaskedCardNumber()}
                  </div>

                  <div className="flex items-end justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-blue-200/70 uppercase">Chủ thẻ</p>
                      <p className="font-bold tracking-wider uppercase font-mono">
                        {cardData.cardHolder || 'NGUYEN VAN A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-blue-200/70 uppercase">Hết hạn</p>
                      <p className="font-bold font-mono">
                        {cardData.expiryDate || 'MM/YY'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security Advisory */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    <strong>Bảo mật tối đa:</strong> Mọi thông tin thẻ chỉ được xác thực định dạng tại trình duyệt và <strong>hoàn toàn KHÔNG gửi lên máy chủ</strong>.
                  </p>
                </div>

                {/* Card Inputs Form */}
                <div className="space-y-4 text-xs">
                  {/* Card Number */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#001D37] flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-[#5E5E5E]" />
                      <span>Số thẻ (16 số demo)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={cardData.cardNumber}
                      onChange={handleCardNumberChange}
                      className={`w-full p-3 bg-[#FAF9FC] border rounded-xl font-mono text-sm focus:outline-none transition-colors ${
                        cardErrors.cardNumber
                          ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                          : 'border-[#E4E4E0] focus:border-[#16324F]'
                      }`}
                    />
                    {cardErrors.cardNumber && (
                      <p className="text-rose-500 text-[11px] font-medium">{cardErrors.cardNumber}</p>
                    )}
                  </div>

                  {/* Card Holder */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#001D37] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#5E5E5E]" />
                      <span>Tên chủ thẻ (in không dấu)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="NGUYEN VAN A"
                      value={cardData.cardHolder}
                      onChange={(e) => {
                        setCardData((prev) => ({ ...prev, cardHolder: e.target.value.toUpperCase() }));
                        if (cardErrors.cardHolder) setCardErrors((prev) => ({ ...prev, cardHolder: '' }));
                      }}
                      className={`w-full p-3 bg-[#FAF9FC] border rounded-xl uppercase text-xs focus:outline-none transition-colors ${
                        cardErrors.cardHolder
                          ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                          : 'border-[#E4E4E0] focus:border-[#16324F]'
                      }`}
                    />
                    {cardErrors.cardHolder && (
                      <p className="text-rose-500 text-[11px] font-medium">{cardErrors.cardHolder}</p>
                    )}
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-[#001D37] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#5E5E5E]" />
                        <span>Hạn dùng (MM/YY)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={cardData.expiryDate}
                        onChange={handleExpiryChange}
                        className={`w-full p-3 bg-[#FAF9FC] border rounded-xl font-mono text-sm focus:outline-none transition-colors ${
                          cardErrors.expiryDate
                            ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                            : 'border-[#E4E4E0] focus:border-[#16324F]'
                        }`}
                      />
                      {cardErrors.expiryDate && (
                        <p className="text-rose-500 text-[11px] font-medium">{cardErrors.expiryDate}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[#001D37] flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#5E5E5E]" />
                        <span>Mã bảo mật (CVV)</span>
                      </label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cardData.cvv}
                        onChange={handleCvvChange}
                        className={`w-full p-3 bg-[#FAF9FC] border rounded-xl font-mono text-sm focus:outline-none transition-colors ${
                          cardErrors.cvv
                            ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                            : 'border-[#E4E4E0] focus:border-[#16324F]'
                        }`}
                      />
                      {cardErrors.cvv && (
                        <p className="text-rose-500 text-[11px] font-medium">{cardErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleProcessCardCheckout}
                  disabled={checkoutMutation.isPending}
                  className="w-full py-4 bg-[#16324F] hover:bg-[#001D37] text-white text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {checkoutMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang xác thực thanh toán thẻ...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Thanh toán ngay ({formatCurrency(cart.totalPrice)})</span>
                    </>
                  )}
                </button>
              </div>
            )}
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
                  {paymentMethod === 'QR_CODE' ? 'Quét mã QR bằng điện thoại' : 'Thẻ Visa/MC (Demo)'}
                </span>
              </div>

              <div className="pt-3 border-t border-[#E4E4E0] flex items-baseline justify-between">
                <span className="text-sm font-bold text-[#001D37]">Tổng thanh toán:</span>
                <div className="text-right">
                  <span className="text-2xl font-bold font-serif text-emerald-700">
                    {formatCurrency(cart.totalPrice)}
                  </span>
                  <p className="text-[10px] text-[#5E5E5E]">Đã bao gồm đầy đủ quyền truy cập khóa học</p>
                </div>
              </div>
            </div>

            {/* Guarantee / Trust Badges */}
            <div className="space-y-2 pt-2 border-t border-[#E4E4E0] text-[11px] text-[#5E5E5E]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kích hoạt quyền học tự động ngay khi điện thoại quét</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Cam kết hỗ trợ giải đáp 24/7 từ đội ngũ giảng viên</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
