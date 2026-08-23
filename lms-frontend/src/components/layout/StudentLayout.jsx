import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Footer } from './Footer';
import { CategoryMegaMenu } from '../navigation/CategoryMegaMenu';
import { 
  BookOpen, 
  Award, 
  LogIn, 
  LogOut, 
  User, 
  ChevronDown, 
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  GraduationCap,
  Menu,
  X
} from 'lucide-react';

export const StudentLayout = ({ currentTab, onNavigate, onOpenAuthModal, children }) => {
  const { user, logout, quickSwitchRole, currentRole, isAdmin, isInstructor } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9FC] text-[#1A1C1E]">
      
      {/* Student Top Navbar - High Contrast & Elevated Shadow */}
      <header className="bg-[#FAFAF8] sticky top-0 z-40 border-b border-[#E4E4E0] shadow-[0_2px_12px_rgba(0,29,55,0.06)]">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Student Nav */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate('student-explore')}
              className="flex items-center gap-2 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 bg-[#16324F] text-white rounded-lg flex items-center justify-center font-extrabold text-lg font-serif shadow-xs group-hover:bg-[#001D37] transition-colors">
                E
              </div>
              <div className="flex items-center">
                <span className="text-[22px] sm:text-2xl font-extrabold font-serif text-[#001D37] tracking-tight group-hover:text-[#16324F] transition-colors">
                  EduMOOC
                </span>
                <span className="hidden sm:inline-block ml-2.5 text-[10px] uppercase font-bold text-[#16324F] bg-[#EFEDF0] border border-[#E4E4E0] px-2 py-0.5 rounded-md">
                  Học viên
                </span>
              </div>
            </button>

            <nav className="hidden md:flex items-center gap-1.5">
              {/* Category Mega Menu (3-tier cascade) */}
              <CategoryMegaMenu 
                onSelectCategory={(query) => onNavigate('student-explore', query)} 
              />

              {user && (
                <button
                  onClick={() => onNavigate('student-my-learning')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    currentTab === 'student-my-learning' || currentTab === 'student-learning'
                      ? 'text-[#16324F] bg-[#F4F3F6] font-bold shadow-2xs'
                      : 'text-[#1A1C1E] hover:text-[#16324F] hover:bg-[#FAF9FC]'
                  }`}
                >
                  Khóa học của tôi
                </button>
              )}

              <button
                onClick={() => onNavigate('student-certificates')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'student-certificates'
                    ? 'text-[#16324F] bg-[#F4F3F6] font-bold shadow-2xs'
                    : 'text-[#1A1C1E] hover:text-[#16324F] hover:bg-[#FAF9FC]'
                }`}
              >
                Chứng chỉ & Xác thực
              </button>
            </nav>
          </div>

          {/* Right Side: Demo Role Switcher & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-2 md:hidden text-[#1A1C1E] hover:bg-[#FAF9FC] rounded-lg cursor-pointer"
              title="Menu"
            >
              {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#EFEDF0] border border-[#E4E4E0] text-[#16324F] rounded-lg hover:bg-[#E3E2E5] transition-colors cursor-pointer shadow-2xs"
                title="Chuyển đổi giao diện vai trò"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Portal: Học viên</span>
                <ChevronDown className="w-3 h-3 text-[#16324F]" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-[#E4E4E0] rounded-lg shadow-sm py-1 z-50">
                  <div className="px-3 py-1 text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider">
                    Chuyển sang Không gian:
                  </div>
                  <button
                    onClick={() => {
                      quickSwitchRole('ROLE_STUDENT');
                      onNavigate('student-explore');
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 font-bold text-[#16324F] bg-[#F4F3F6]"
                  >
                    <GraduationCap className="w-3.5 h-3.5" /> Giao diện Học viên
                  </button>
                  <button
                    onClick={() => {
                      quickSwitchRole('ROLE_INSTRUCTOR');
                      onNavigate('instructor-dashboard');
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-[#1A1C1E] hover:bg-[#FAF9FC]"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" /> Portal Giảng viên
                  </button>
                  <button
                    onClick={() => {
                      quickSwitchRole('ROLE_ADMIN');
                      onNavigate('admin-overview');
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-[#1A1C1E] hover:bg-[#FAF9FC]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#16324F]" /> Portal Quản trị viên
                  </button>
                </div>
              )}
            </div>

            {/* User Account / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#E4E4E0] transition-all"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={user.fullName || user.email}
                    className="w-8 h-8 rounded-full object-cover border border-[#E4E4E0]"
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-1 w-52 bg-white border border-[#E4E4E0] rounded-lg shadow-sm py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#E4E4E0]">
                      <p className="text-xs font-semibold text-[#1A1C1E] truncate">{user.fullName || 'Học viên'}</p>
                      <p className="text-[11px] text-[#6B6B6B] truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate('student-profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#1A1C1E] hover:bg-[#F4F3F6] flex items-center gap-2 font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-[#16324F]" /> Hồ sơ cá nhân
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('student-my-learning');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#1A1C1E] hover:bg-[#F4F3F6] flex items-center gap-2"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Khóa học của tôi
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('student-certificates');
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#16324F] hover:bg-[#FAF9FC] rounded-lg transition-colors border border-[#E4E4E0]"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-3.5 py-1.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Đăng ký
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileDrawerOpen && (
          <div className="md:hidden border-t border-[#E4E4E0] bg-white px-6 py-4 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
            {/* Quick Links */}
            <div className="flex flex-col space-y-2 border-b border-[#E4E4E0] pb-3">
              {user && (
                <button
                  onClick={() => {
                    onNavigate('student-my-learning');
                    setMobileDrawerOpen(false);
                  }}
                  className="text-left text-xs font-semibold text-[#16324F] py-1.5 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" /> Khóa học của tôi
                </button>
              )}
              <button
                onClick={() => {
                  onNavigate('student-certificates');
                  setMobileDrawerOpen(false);
                }}
                className="text-left text-xs font-semibold text-[#16324F] py-1.5 flex items-center gap-2"
              >
                <Award className="w-4 h-4" /> Chứng chỉ & Xác thực
              </button>
            </div>

            {/* Mobile Category Accordion */}
            <CategoryMegaMenu
              isMobile={true}
              onSelectCategory={(query) => {
                onNavigate('student-explore', query);
                setMobileDrawerOpen(false);
              }}
            />
          </div>
        )}
      </header>

      {/* Main Student Content with Unified Page Transition */}
      <div key={currentTab} className="flex-1 animate-page-transition">
        {children}
      </div>

      {/* Student Footer */}
      <Footer />

    </div>
  );
};
