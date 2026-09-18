import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  CreditCard,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useCart, useRemoveFromCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUrl';
import { useToast } from '../../context/ToastContext';

export const CartPage = () => {
  const navigate = useNavigate();
  const { data: cart = { items: [], totalPrice: 0, totalItems: 0 }, isLoading } = useCart();
  const removeMutation = useRemoveFromCart();
  const { showToast } = useToast();

  const handleRemove = async (courseId, courseTitle) => {
    try {
      await removeMutation.mutateAsync(courseId);
      showToast(`Đã xóa "${courseTitle}" khỏi giỏ hàng`, 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi xóa khỏi giỏ hàng', 'error');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9FC] flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#16324F] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-[#5E5E5E]">Đang tải giỏ hàng của bạn...</p>
        </div>
      </div>
    );
  }

  const items = cart.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-[#FAF9FC] pb-24 text-[#1A1C1E]">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#001D37] via-[#16324F] to-[#0A2540] text-white py-10 relative overflow-hidden shadow-md">
        <div className="max-w-[1280px] mx-auto px-6 relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-xs text-blue-200/80">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-300 font-bold">Giỏ hàng của bạn</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <ShoppingCart className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-serif">Giỏ hàng khóa học</h1>
              <p className="text-xs text-blue-100/70 mt-0.5">
                {items.length > 0 ? `Bạn đang có ${items.length} khóa học trong giỏ hàng` : 'Giỏ hàng đang trống'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1280px] mx-auto px-6 pt-8">
        {isEmpty ? (
          /* Empty State */
          <div className="bg-white border border-[#E4E4E0] rounded-2xl p-12 text-center max-w-xl mx-auto space-y-6 shadow-xs">
            <div className="w-20 h-20 bg-[#F4F3F6] rounded-full flex items-center justify-center mx-auto text-[#5E5E5E]">
              <ShoppingCart className="w-10 h-10 text-[#16324F]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-serif text-[#001D37]">
                Giỏ hàng của bạn đang trống
              </h2>
              <p className="text-xs text-[#5E5E5E] max-w-md mx-auto leading-relaxed">
                Khám phá hàng trăm khóa học chất lượng cao từ các chuyên gia đầu ngành trên nền tảng EduMOOC ngay hôm nay!
              </p>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md"
            >
              <BookOpen className="w-4 h-4" />
              <span>Khám phá khóa học ngay</span>
            </button>
          </div>
        ) : (
          /* Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Item List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E4E0]">
                <h2 className="font-serif font-bold text-base text-[#001D37]">
                  Danh sách khóa học ({items.length})
                </h2>
                <Link
                  to="/courses"
                  className="text-xs font-bold text-[#16324F] hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Tiếp tục chọn khóa học</span>
                </Link>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#E4E4E0] hover:border-[#16324F]/30 rounded-xl p-4 shadow-2xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Thumbnail + Details */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <img
                        src={getImageUrl(item.thumbnailUrl) || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300'}
                        alt={item.courseTitle}
                        className="w-24 h-16 object-cover rounded-lg shrink-0 border border-[#E4E4E0]"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300';
                        }}
                      />
                      <div className="space-y-1 min-w-0">
                        <Link
                          to={`/courses/${item.courseSlug}`}
                          className="font-bold text-sm text-[#001D37] hover:text-blue-700 transition-colors line-clamp-1 block"
                        >
                          {item.courseTitle}
                        </Link>
                        <p className="text-xs text-[#5E5E5E]">
                          Giảng viên: <span className="font-medium text-[#1A1C1E]">{item.instructorName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Price + Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4E4E0]">
                      <div className="text-right">
                        <p className="font-serif font-extrabold text-base text-[#001D37]">
                          {formatCurrency(item.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.courseId, item.courseTitle)}
                        disabled={removeMutation.isPending}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa khỏi giỏ hàng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-4 bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs space-y-6 sticky top-24">
              <h3 className="font-serif font-extrabold text-base text-[#001D37] border-b border-[#E4E4E0] pb-3">
                Tổng quan thanh toán
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-[#5E5E5E]">
                  <span>Số lượng khóa học:</span>
                  <span className="font-bold text-[#1A1C1E]">{items.length}</span>
                </div>
                <div className="flex items-center justify-between text-[#5E5E5E]">
                  <span>Tạm tính:</span>
                  <span className="font-medium text-[#1A1C1E]">{formatCurrency(cart.totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-[#5E5E5E]">
                  <span>Ưu đãi áp dụng:</span>
                  <span className="text-emerald-600 font-semibold">0₫</span>
                </div>

                <div className="pt-3 border-t border-[#E4E4E0] flex items-baseline justify-between">
                  <span className="text-sm font-bold text-[#001D37]">Tổng tiền:</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-serif text-emerald-700">
                      {formatCurrency(cart.totalPrice)}
                    </span>
                    <p className="text-[10px] text-[#5E5E5E]">Đã bao gồm thuế GTGT (nếu có)</p>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <CreditCard className="w-4 h-4" />
                <span>Tiến hành thanh toán</span>
              </button>

              {/* Trust Badges */}
              <div className="space-y-2 pt-2 border-t border-[#E4E4E0] text-[11px] text-[#5E5E5E]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bảo mật giao dịch chuẩn mã hóa SSL 256-bit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Truy cập trọn đời sau khi hoàn tất thanh toán</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
