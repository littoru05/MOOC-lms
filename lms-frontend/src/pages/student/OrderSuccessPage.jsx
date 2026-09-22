import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Receipt, 
  Calendar, 
  CreditCard,
  QrCode,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUrl';

export const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  const items = order?.items || [];

  return (
    <div className="min-h-screen bg-[#FAF9FC] pb-24 text-[#1A1C1E]">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-[#001D37] via-[#16324F] to-[#0A2540] text-white py-14 shadow-md relative overflow-hidden">
        <div className="max-w-[1000px] mx-auto px-6 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 mb-2 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
              Giao dịch hoàn tất
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif">
              Thanh toán đơn hàng thành công!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-lg mx-auto">
              Cảm ơn bạn đã lựa chọn khóa học tại EduMOOC. Khóa học đã được tự động kích hoạt vào tài khoản học tập của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1000px] mx-auto px-6 -mt-8 relative z-20 space-y-6">
        {order ? (
          <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Order Meta Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl text-xs">
              <div className="space-y-1">
                <span className="text-[#5E5E5E] flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5 text-[#16324F]" /> Mã đơn hàng:
                </span>
                <p className="font-mono font-bold text-[#001D37]">{order.orderCode}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[#5E5E5E] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#16324F]" /> Ngày mua:
                </span>
                <p className="font-semibold text-[#1A1C1E]">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[#5E5E5E] flex items-center gap-1">
                  {order.paymentMethod === 'CARD' ? (
                    <CreditCard className="w-3.5 h-3.5 text-[#16324F]" />
                  ) : (
                    <QrCode className="w-3.5 h-3.5 text-[#16324F]" />
                  )}
                  Phương thức:
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] bg-blue-50 text-blue-800 border border-blue-200">
                  {order.paymentMethod === 'CARD' ? 'Đã thanh toán qua Thẻ (Demo)' : 'Đã thanh toán qua QR (Demo)'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[#5E5E5E]">Tổng thanh toán:</span>
                <p className="font-serif font-bold text-base text-emerald-700">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>

            {/* Course List */}
            <div className="space-y-3">
              <h2 className="font-serif font-bold text-sm text-[#001D37] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Khóa học đã sở hữu ({items.length}):</span>
              </h2>

              <div className="divide-y divide-[#E4E4E0] border border-[#E4E4E0] rounded-xl overflow-hidden">
                {items.map((item) => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#FAF9FC] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getImageUrl(item.courseThumbnailUrl) || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300'}
                        alt={item.courseTitle}
                        className="w-20 h-14 object-cover rounded-lg shrink-0 border border-[#E4E4E0]"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300';
                        }}
                      />
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-bold text-xs text-[#001D37] line-clamp-1">
                          {item.courseTitle}
                        </h3>
                        <p className="text-[11px] text-emerald-600 font-medium">Đã kích hoạt vào học</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                      <span className="font-serif font-bold text-xs text-[#001D37]">
                        {formatCurrency(item.price)}
                      </span>
                      {item.courseId && (
                        <Link
                          to={`/learn/${item.courseId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16324F] hover:underline"
                        >
                          <span>Học ngay</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#E4E4E0] flex flex-col sm:flex-row items-center justify-end gap-3">
              <Link
                to="/courses"
                className="w-full sm:w-auto px-5 py-2.5 border border-[#16324F]/30 text-[#16324F] hover:bg-blue-50 text-xs font-semibold rounded-xl text-center transition-colors"
              >
                Khám phá thêm
              </Link>

              <button
                onClick={() => navigate('/my-learning')}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Vào học ngay</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E4E4E0] rounded-2xl p-8 text-center shadow-sm space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-serif font-bold text-base text-[#001D37]">
              Đơn hàng đã được ghi nhận
            </h2>
            <p className="text-xs text-[#5E5E5E] max-w-sm mx-auto">
              Bạn có thể bắt đầu học tập và theo dõi tiến độ các khóa học trong mục Khóa học của tôi.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/courses"
                className="px-5 py-2.5 border border-[#E4E4E0] hover:bg-[#FAF9FC] text-[#1A1C1E] text-xs font-semibold rounded-xl"
              >
                Khám phá thêm
              </Link>
              <Link
                to="/my-learning"
                className="px-5 py-2.5 bg-[#16324F] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Khóa học của tôi
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
