import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import { 
  BookOpen, 
  GraduationCap, 
  Award, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  User, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ currentTab, onNavigate, onOpenAuthModal }) => {
  const { user, logout, quickSwitchRole, currentRole, isAdmin, isInstructor } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-[#E4E4E0]">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => onNavigate('explore')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-9 h-9 bg-[#16324F] text-white rounded-lg flex items-center justify-center font-bold text-lg font-serif">
              E
            </div>
            <div>
              <span className="text-2xl font-bold font-serif text-[#001D37] tracking-tight group-hover:text-[#16324F]">
                EduMOOC
              </span>
            </div>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('explore')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'explore'
                  ? 'text-[#16324F] bg-[#F4F3F6] font-semibold'
                  : 'text-[#5E5E5E] hover:text-[#1A1C1E] hover:bg-[#FAF9FC]'
              }`}
            >
              Khám phá
            </button>

            {user && (
              <button
                onClick={() => onNavigate('my-learning')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentTab === 'my-learning'
                    ? 'text-[#16324F] bg-[#F4F3F6] font-semibold'
                    : 'text-[#5E5E5E] hover:text-[#1A1C1E] hover:bg-[#FAF9FC]'
                }`}
              >
                Khóa học của tôi
              </button>
            )}

            <button
              onClick={() => onNavigate('certificates')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'certificates'
                  ? 'text-[#16324F] bg-[#F4F3F6] font-semibold'
                  : 'text-[#5E5E5E] hover:text-[#1A1C1E] hover:bg-[#FAF9FC]'
              }`}
            >
              Chứng chỉ & Xác thực
            </button>

            {/* Giảng viên Portal */}
            {(isInstructor || isAdmin) && (
              <button
                onClick={() => onNavigate('instructor-dashboard')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === 'instructor-dashboard' || currentTab === 'course-editor'
                    ? 'text-[#16324F] bg-[#F4F3F6] font-semibold'
                    : 'text-[#5E5E5E] hover:text-[#1A1C1E] hover:bg-[#FAF9FC]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Giảng dạy
              </button>
            )}

            {/* Quản trị viên Portal */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin-overview')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab?.startsWith('admin')
                    ? 'text-[#16324F] bg-[#F4F3F6] font-semibold'
                    : 'text-[#5E5E5E] hover:text-[#1A1C1E] hover:bg-[#FAF9FC]'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#16324F]" />
                Quản trị Admin
              </button>
            )}
          </nav>
        </div>

        {/* Right Side: Demo Role Switcher & Auth Profile */}
        <div className="flex items-center gap-3">
          
          {/* Quick Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#EFEDF0] border border-[#E4E4E0] text-[#16324F] rounded-md hover:bg-[#E3E2E5] transition-colors"
              title="Chuyển đổi vai trò demo nhanh"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {currentRole === 'ROLE_ADMIN'
                  ? 'Admin'
                  : currentRole === 'ROLE_INSTRUCTOR'
                  ? 'Giảng viên'
                  : 'Học viên'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#5E5E5E]" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E4E4E0] rounded-lg shadow-sm py-1 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-wider">
                  Chuyển vai trò demo:
                </div>
                <button
                  onClick={() => {
                    quickSwitchRole('ROLE_STUDENT');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-[#F4F3F6] ${
                    currentRole === 'ROLE_STUDENT' ? 'font-bold text-[#16324F]' : 'text-[#1A1C1E]'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" /> Học viên (Student)
                </button>
                <button
                  onClick={() => {
                    quickSwitchRole('ROLE_INSTRUCTOR');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-[#F4F3F6] ${
                    currentRole === 'ROLE_INSTRUCTOR' ? 'font-bold text-[#16324F]' : 'text-[#1A1C1E]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Giảng viên (Instructor)
                </button>
                <button
                  onClick={() => {
                    quickSwitchRole('ROLE_ADMIN');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-[#F4F3F6] ${
                    currentRole === 'ROLE_ADMIN' ? 'font-bold text-[#16324F]' : 'text-[#1A1C1E]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Quản trị viên (Admin)
                </button>
              </div>
            )}
          </div>

          {/* User Account / Login Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#E4E4E0] transition-all"
              >
                <img
                  src={getImageUrl(user.avatarUrl, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')}
                  alt={user.fullName || user.email}
                  className="w-8 h-8 rounded-full object-cover border border-[#E4E4E0]"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-[#E4E4E0] rounded-lg shadow-sm py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#E4E4E0]">
                    <p className="text-xs font-semibold text-[#1A1C1E] truncate">{user.fullName || 'Người dùng'}</p>
                    <p className="text-[11px] text-[#6B6B6B] truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('my-learning');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#1A1C1E] hover:bg-[#F4F3F6] flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Khóa học của tôi
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('certificates');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#1A1C1E] hover:bg-[#F4F3F6] flex items-center gap-2"
                  >
                    <Award className="w-3.5 h-3.5" /> Chứng chỉ của tôi
                  </button>
                  <div className="border-t border-[#E4E4E0] my-1"></div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#BA1A1A] hover:bg-[#FFDAD6] flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
