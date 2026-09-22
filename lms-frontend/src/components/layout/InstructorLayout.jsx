import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import { UserMenuDropdown } from '../common/UserMenuDropdown';
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
  TrendingUp
} from 'lucide-react';

export const InstructorLayout = ({ currentTab: currentTabProp, onNavigate, onCreateCourse, children }) => {
  const { user, logout, quickSwitchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const pathname = location.pathname;

  const isDashboard = pathname === '/instructor/dashboard' || pathname === '/instructor';
  const isCreate = pathname === '/instructor/courses/create';
  const isEdit = pathname.includes('/editor');
  const isQuiz = pathname.includes('/quiz-builder');
  const isStudents = pathname.startsWith('/instructor/students');
  const isRevenue = pathname.startsWith('/instructor/revenue');
  const isProfile = pathname === '/instructor/profile';

  return (
    <div className="min-h-screen flex bg-[#FAF9FC] text-[#1A1C1E]">
      
      {/* Fixed Left Sidebar for Instructor - Deep Scholarly Navy Theme */}
      <aside className="w-64 h-screen fixed left-0 top-0 bg-[#001D37] text-white flex flex-col justify-between py-6 z-40 border-r border-[#16324F] shadow-xl">
        <div>
          
          {/* Header Brand */}
          <div className="px-6 mb-8">
            <Link to="/instructor/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#16324F] border border-blue-400/30 text-white flex items-center justify-center font-extrabold text-lg font-serif shadow-md">
                E
              </div>
              <div>
                <h2 className="font-serif font-extrabold text-base text-white tracking-wide">Instructor Portal</h2>
                <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">EduMOOC Studio</p>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5 px-3">
            <div className="px-3 py-1 text-[10px] font-bold text-blue-300/60 uppercase tracking-wider">
              Quản lý giảng dạy
            </div>

            <Link
              to="/instructor/dashboard"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                isDashboard
                  ? 'bg-[#16324F] text-white font-bold border-l-4 border-amber-400 shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Bảng điều khiển & Khóa học</span>
            </Link>

            <Link
              to="/instructor/courses/create"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                isCreate
                  ? 'bg-[#16324F] text-white font-bold border-l-4 border-emerald-400 shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Tạo khóa học mới</span>
            </Link>

            <Link
              to="/instructor/courses/editor"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                isEdit
                  ? 'bg-[#16324F] text-white font-bold border-l-4 border-blue-400 shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Edit3 className="w-4 h-4 text-blue-400" />
              <span>Soạn bài học & Đề cương</span>
            </Link>

            <Link
              to="/instructor/courses/quiz-builder"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                isQuiz
                  ? 'bg-[#16324F] text-white font-bold border-l-4 border-purple-400 shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>Soạn đề thi Quiz</span>
            </Link>

            <Link
              to="/instructor/students"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                isStudents
                  ? 'bg-[#16324F] text-white font-bold border-l-4 border-cyan-400 shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Tiến độ học viên</span>
            </Link>

            <Link
              to="/instructor/revenue"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                isRevenue
                  ? 'bg-[#16324F] text-white font-bold border-l-4 border-emerald-400 shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Doanh thu & Thu nhập</span>
            </Link>

            <Link
              to="/instructor/profile"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                isProfile
                  ? 'bg-[#16324F] text-white font-bold border-l-4 border-rose-400 shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <User className="w-4 h-4 text-rose-400" />
              <span>Hồ sơ cá nhân</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Bottom: Instructor Profile & Logout */}
        <div className="px-4 border-t border-[#16324F] pt-4 space-y-3">
          <Link
            to="/instructor/profile"
            className="w-full flex items-center gap-3 text-left p-2 rounded-xl bg-[#0A2540] hover:bg-[#16324F] transition-all border border-[#16324F] cursor-pointer"
          >
            <img
              src={getImageUrl(user?.avatarUrl, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')}
              alt={user?.fullName}
              className="w-9 h-9 rounded-full object-cover border-2 border-amber-400"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'TS. Nguyễn Văn A'}</p>
              <p className="text-[10px] text-amber-300 font-semibold">Giảng viên Chuyên môn →</p>
            </div>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all border border-red-500/30 cursor-pointer"
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
                : 'Hồ sơ cá nhân'}
            </span>
          </div>

          {/* Right Header: Role Badge & User Menu */}
          <div className="flex items-center gap-3">
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
