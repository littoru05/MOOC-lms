import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Receipt, 
  Calendar, 
  CreditCard, 
  QrCode,
  ArrowRight, 
  BookOpen, 
  ShoppingBag, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useOrderHistory } from '../../hooks/useOrders';
import { formatCurrency } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUrl';

export const OrdersHistoryPage = () => {
  const { data: orders = [], isLoading } = useOrderHistory();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9FC] flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#16324F] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-[#5E5E5E]">Đang tải lịch sử đơn hàng...</p>
        </div>
      </div>
    );
  }

  const isEmpty = orders.length === 0;

  return (
    <div className="min-h-screen bg-[#FAF9FC] pb-24 text-[#1A1C1E]">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#001D37] via-[#16324F] to-[#0A2540] text-white py-10 relative overflow-hidden shadow-md">
        <div className="max-w-[1280px] mx-auto px-6 relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-xs text-blue-200/80">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-300 font-bold">Lịch sử đơn hàng</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <Receipt className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-serif">Lịch sử giao dịch & Đơn hàng</h1>
              <p className="text-xs text-blue-100/70 mt-0.5">
                {orders.length > 0 ? `Bạn đã thực hiện ${orders.length} giao dịch mua khóa học` : 'Chưa có giao dịch nào được ghi nhận'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {isEmpty ? (
          <div className="bg-white border border-[#E4E4E0] rounded-2xl p-12 text-center shadow-xs max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 bg-[#FAF9FC] text-[#5E5E5E] rounded-full mx-auto flex items-center justify-center border border-[#E4E4E0]">
              <ShoppingBag className="w-8 h-8 opacity-60" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-serif font-bold text-base text-[#001D37]">
                Bạn chưa có đơn hàng nào
              </h2>
              <p className="text-xs text-[#5E5E5E] max-w-sm mx-auto leading-relaxed">
                Tất cả các khóa học có phí sau khi bạn thanh toán sẽ được lưu trữ biên lai chi tiết tại đây.
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Khám phá khóa học</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const items = order.items || [];
              return (
                <div
                  key={order.id}
                  className="bg-white border border-[#E4E4E0] hover:border-[#16324F]/30 rounded-2xl shadow-2xs overflow-hidden transition-all"
                >
                  {/* Order Top Summary Bar */}
                  <div className="p-4 sm:p-5 bg-[#FAF9FC] border-b border-[#E4E4E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                      <div className="space-y-0.5">
                        <span className="text-[11px] text-[#5E5E5E] block">MÃ ĐƠN HÀNG</span>
                        <span className="font-mono font-bold text-[#001D37]">{order.orderCode}</span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[11px] text-[#5E5E5E] block">NGÀY ĐẶT</span>
                        <span className="font-medium text-[#1A1C1E]">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '—'}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[11px] text-[#5E5E5E] block">TRẠNG THÁI</span>
                        <span className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Hoàn tất
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[11px] text-[#5E5E5E] block">PHƯƠNG THỨC</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-[#16324F] bg-blue-50/80 border border-blue-200/80 px-2 py-0.5 rounded-full">
                          {order.paymentMethod === 'CARD' ? (
                            <>
                              <CreditCard className="w-3 h-3 text-blue-600" />
                              <span>Đã thanh toán qua Thẻ</span>
                            </>
                          ) : (
                            <>
                              <QrCode className="w-3 h-3 text-emerald-600" />
                              <span>Đã thanh toán qua QR</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right space-y-0.5">
                      <span className="text-[11px] text-[#5E5E5E] block">TỔNG TIỀN</span>
                      <span className="font-serif font-bold text-base text-emerald-700">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="p-4 sm:p-5 divide-y divide-[#E4E4E0]">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={getImageUrl(item.courseThumbnailUrl) || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300'}
                            alt={item.courseTitle}
                            className="w-20 h-14 object-cover rounded-lg shrink-0 border border-[#E4E4E0]"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300';
                            }}
                          />
                          <div className="space-y-1 min-w-0">
                            <Link
                              to={`/courses/${item.courseSlug}`}
                              className="font-bold text-xs text-[#001D37] hover:text-blue-700 line-clamp-1 transition-colors"
                            >
                              {item.courseTitle}
                            </Link>
                            <p className="text-[11px] text-[#5E5E5E]">
                              Giá đã mua: <span className="font-semibold text-[#1A1C1E]">{formatCurrency(item.price)}</span>
                            </p>
                          </div>
                        </div>

                        {item.courseId && (
                          <Link
                            to={`/learn/${item.courseId}`}
                            className="shrink-0 px-4 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-end sm:self-center"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Vào học</span>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
