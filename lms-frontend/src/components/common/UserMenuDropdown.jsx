import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';
import { getImageUrl } from '../../utils/imageUrl';
import { 
  User, 
  BookOpen, 
  Award, 
  ShoppingCart, 
  Receipt, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const UserMenuDropdown = ({ 
  triggerClassName = '',
  align = 'right',
  customTrigger = null
}) => {
  const { user, logout, isStudent, isInstructor, isAdmin, currentRole } = useAuth();
  const { data: cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    if (isAdmin || currentRole === 'ROLE_ADMIN') {
      navigate('/admin/profile');
    } else if (isInstructor || currentRole === 'ROLE_INSTRUCTOR') {
      navigate('/instructor/profile');
    } else {
      navigate('/profile');
    }
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/');
  };

  const roleLabel = isAdmin 
    ? 'Quản trị viên' 
    : isInstructor 
      ? 'Giảng viên Chuyên môn' 
      : 'Học viên';

  const roleBadgeStyle = isAdmin
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : isInstructor
      ? 'bg-blue-50 text-blue-800 border-blue-200'
      : 'bg-emerald-50 text-emerald-800 border-emerald-200';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      {customTrigger ? (
        <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          {customTrigger}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={`flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#16324F]/20 transition-all cursor-pointer ${triggerClassName}`}
        >
          <img
            src={getImageUrl(user.avatarUrl, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')}
            alt={user.fullName || user.email}
            className="w-8 h-8 rounded-full object-cover border border-[#E4E4E0] shadow-2xs"
          />
        </button>
      )}

      {/* Dropdown Menu Card */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-64 bg-white border border-[#E4E4E0] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-[#1A1C1E]`}
          role="menu"
        >
          {/* Header: User Profile Info */}
          <div 
            onClick={handleProfileClick}
            className="px-4 py-3 border-b border-[#E4E4E0] hover:bg-[#FAF9FC] transition-colors cursor-pointer group flex items-center gap-3"
          >
            <img
              src={getImageUrl(user.avatarUrl, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')}
              alt={user.fullName}
              className="w-10 h-10 rounded-full object-cover border border-[#E4E4E0] shrink-0 group-hover:ring-2 group-hover:ring-[#16324F]/30 transition-all"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#001D37] truncate group-hover:text-[#16324F]">
                {user.fullName || 'Người dùng LMS'}
              </p>
              <p className="text-[11px] text-[#5E5E5E] truncate">
                {user.email}
              </p>
              <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${roleBadgeStyle}`}>
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Group 1: Học tập (Chỉ hiển thị cho Học viên) */}
          {isStudent && (
            <div className="py-1 border-t border-[#E4E4E0]">
              <button
                type="button"
                onClick={() => handleNavigate('/my-learning')}
                className="w-full text-left px-4 py-2 text-xs hover:bg-[#F4F3F6] flex items-center justify-between text-[#1A1C1E] font-medium transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#16324F] group-hover:scale-110 transition-transform" />
                  <span>Khóa học của tôi</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/certificates')}
                className="w-full text-left px-4 py-2 text-xs hover:bg-[#F4F3F6] flex items-center justify-between text-[#1A1C1E] font-medium transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-[#16324F] group-hover:scale-110 transition-transform" />
                  <span>Chứng chỉ của tôi</span>
                </div>
              </button>
            </div>
          )}

          {/* Group 2: Cổng chức năng Giảng viên (Chỉ hiển thị cho Giảng viên) */}
          {isInstructor && (
            <div className="py-1 border-t border-[#E4E4E0]">
              <button
                type="button"
                onClick={() => handleNavigate('/instructor/dashboard')}
                className="w-full text-left px-4 py-2 text-xs hover:bg-blue-50/70 flex items-center justify-between text-blue-900 font-semibold transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-blue-700 group-hover:scale-110 transition-transform" />
                  <span>Bảng điều khiển Giảng viên</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* Group 2b: Cổng chức năng Quản trị (Chỉ hiển thị cho Quản trị viên) */}
          {isAdmin && (
            <div className="py-1 border-t border-[#E4E4E0]">
              <button
                type="button"
                onClick={() => handleNavigate('/admin/dashboard')}
                className="w-full text-left px-4 py-2 text-xs hover:bg-amber-50/70 flex items-center justify-between text-amber-900 font-semibold transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
                  <span>Trang Quản trị Admin</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* Group 3: Mua sắm & Đơn hàng (Chỉ hiển thị cho Học viên) */}
          {isStudent && (
            <div className="py-1 border-t border-[#E4E4E0]">
              <button
                type="button"
                onClick={() => handleNavigate('/cart')}
                className="w-full text-left px-4 py-2 text-xs hover:bg-[#F4F3F6] flex items-center justify-between text-[#1A1C1E] font-medium transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4 text-[#16324F] group-hover:scale-110 transition-transform" />
                  <span>Giỏ hàng của tôi</span>
                </div>
                {cart?.totalItems > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded-full leading-none shadow-2xs">
                    {cart.totalItems}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/orders')}
                className="w-full text-left px-4 py-2 text-xs hover:bg-[#F4F3F6] flex items-center justify-between text-[#1A1C1E] font-medium transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-[#16324F] group-hover:scale-110 transition-transform" />
                  <span>Lịch sử đơn hàng</span>
                </div>
              </button>
            </div>
          )}

          {/* Group 4: Cài đặt tài khoản & Hồ sơ */}
          <div className="py-1 border-t border-[#E4E4E0]">
            <button
              type="button"
              onClick={handleProfileClick}
              className="w-full text-left px-4 py-2 text-xs hover:bg-[#F4F3F6] flex items-center gap-2.5 text-[#1A1C1E] font-medium transition-colors cursor-pointer group"
            >
              <User className="w-4 h-4 text-[#16324F] group-hover:scale-110 transition-transform" />
              <span>Hồ sơ cá nhân</span>
            </button>
          </div>

          {/* Group 5: Đăng xuất */}
          <div className="py-1 border-t border-[#E4E4E0]">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer group"
            >
              <LogOut className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
