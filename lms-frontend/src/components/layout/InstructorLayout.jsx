import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import { UserMenuDropdown } from '../common/UserMenuDropdown';
import { NotificationBell } from '../common/NotificationBell';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  HelpCircle, 
  Users, 
  LogOut, 
  ChevronRight, 
  Sparkles,
  LayoutDashboard,
  GraduationCap,
  ShieldCheck,
  User,
  TrendingUp,
  Bell
} from 'lucide-react';

export const InstructorLayout = ({ currentTab: currentTabProp, onNavigate, onCreateCourse, children }) => {
  const { user, logout, quickSwitchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const pathname = location.pathname;

  const isDashboard = pathname === '/instructor/dashboard' || pathname === '/instructor';
  const isCreate = pathname.includes('/create');
  const isEdit = pathname.includes('/editor');
  const isQuiz = pathname.includes('/quiz-builder');
  const isStudents = pathname.includes('/students');
  const isRevenue = pathname.includes('/revenue');
  const isProfile = pathname.includes('/profile');
  const isNotifications = pathname.includes('/instructor/notifications');

  return (
    <div className="min-h-screen bg-[#FAF9FC] text-[#1A1C1E] flex flex-col font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#001D37] text-white flex flex-col fixed inset-y-0 left-0 z-40 border-r border-[#002B4E]">
        
        {/* Brand / Logo */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-sm font-serif font-black text-xl">
            E
          </div>
          <div>
            <span className="font-serif font-bold text-base tracking-tight text-white block">
              EduMOOC
            </span>
            <span className="text-[10px] text-amber-300 font-medium uppercase tracking-wider block">
              Instructor Studio
            </span>
          </div>
        </div>

        {/* Quick Action: Tạo khóa học */}
        <div className="p-4 border-b border-white/10">
          <button
            onClick={() => {
              if (onCreateCourse) onCreateCourse();
              else navigate('/instructor/courses/create');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-[#001D37] font-bold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tạo khóa học mới</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <Link
            to="/instructor/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              isDashboard
                ? 'bg-white/15 text-white font-semibold shadow-xs'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${isDashboard ? 'text-amber-400' : 'text-white/60'}`} />
            <span>Tổng quan & Khóa học</span>
          </Link>

          <Link
            to="/instructor/courses/editor"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              isEdit
                ? 'bg-white/15 text-white font-semibold shadow-xs'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Edit3 className={`w-4 h-4 ${isEdit ? 'text-amber-400' : 'text-white/60'}`} />
            <span>Soạn thảo bài giảng</span>
          </Link>

          <Link
            to="/instructor/courses/quiz-builder"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              isQuiz
                ? 'bg-white/15 text-white font-semibold shadow-xs'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <HelpCircle className={`w-4 h-4 ${isQuiz ? 'text-amber-400' : 'text-white/60'}`} />
            <span>Khảo thí & Đề thi</span>
          </Link>

          <Link
            to="/instructor/students"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              isStudents
                ? 'bg-white/15 text-white font-semibold shadow-xs'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className={`w-4 h-4 ${isStudents ? 'text-amber-400' : 'text-white/60'}`} />
            <span>Tiến độ học viên</span>
          </Link>

          <Link
            to="/instructor/revenue"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              isRevenue
                ? 'bg-white/15 text-white font-semibold shadow-xs'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${isRevenue ? 'text-amber-400' : 'text-white/60'}`} />
            <span>Doanh thu & Thu nhập</span>
          </Link>

          <Link
            to="/instructor/notifications"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              isNotifications
                ? 'bg-white/15 text-white font-semibold shadow-xs'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Bell className={`w-4 h-4 ${isNotifications ? 'text-amber-400' : 'text-white/60'}`} />
            <span>Thông báo</span>
          </Link>

          <Link
            to="/instructor/profile"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              isProfile
                ? 'bg-white/15 text-white font-semibold shadow-xs'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <User className={`w-4 h-4 ${isProfile ? 'text-amber-400' : 'text-white/60'}`} />
            <span>Hồ sơ giảng viên</span>
          </Link>
        </nav>

        {/* Role Quick Switch Menu (Floating Dropdown) */}
        {showRoleMenu && (
          <div className="mx-3 mb-2 p-2 bg-[#002B4E] border border-white/10 rounded-lg shadow-xl text-xs space-y-1 z-50">
            <p className="text-[10px] uppercase font-bold text-amber-300 px-2 py-1">Chuyển vai trò thử nghiệm</p>
            <button
              onClick={() => { quickSwitchRole('STUDENT'); setShowRoleMenu(false); navigate('/'); }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/10 text-white/80 flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
              <span>Học viên (Student)</span>
            </button>
            <button
              onClick={() => { quickSwitchRole('ADMIN'); setShowRoleMenu(false); navigate('/admin/dashboard'); }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/10 text-white/80 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Quản trị viên (Admin)</span>
            </button>
          </div>
        )}

        {/* Bottom Role Switch Trigger & Logout */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Chuyển vai trò</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showRoleMenu ? 'rotate-90' : ''}`} />
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E4E4E0] sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#5E5E5E]">
            <span className="font-semibold text-[#16324F]">EduMOOC Studio</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="capitalize text-[#1A1C1E]">
              {isDashboard
                ? 'Tổng quan & Khóa học'
                : isCreate
                ? 'Tạo khóa học mới'
                : isEdit
                ? 'Soạn thảo khóa học'
                : isQuiz
                ? 'Biên soạn đề thi'
                : isStudents
                ? 'Tiến độ học viên'
                : isRevenue
                ? 'Doanh thu & Thu nhập'
                : isNotifications
                ? 'Thông báo'
                : 'Hồ sơ cá nhân'}
            </span>
          </div>

          {/* Right Header: Role Badge & User Menu */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#EFEDF0] border border-[#E4E4E0] text-[#16324F] rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Portal: Giảng viên</span>
            </div>

            <UserMenuDropdown />
          </div>
        </header>

        {/* Dynamic View with Unified Page Transition */}
        <main key={pathname} className="flex-1 animate-page-transition">
          {children || <Outlet />}
        </main>

      </div>

    </div>
  );
};
