import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  User
} from 'lucide-react';

export const InstructorLayout = ({ currentTab, onNavigate, onCreateCourse, children }) => {
  const { user, logout, quickSwitchRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FAF9FC] text-[#1A1C1E]">
      
      {/* Fixed Left Sidebar for Instructor - Deep Scholarly Navy Theme */}
      <aside className="w-64 h-screen fixed left-0 top-0 bg-[#001D37] text-white flex flex-col justify-between py-6 z-40 border-r border-[#16324F] shadow-xl">
        <div>
          
          {/* Header Brand */}
          <div className="px-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#16324F] border border-blue-400/30 text-white flex items-center justify-center font-extrabold text-lg font-serif shadow-md">
                E
              </div>
              <div>
                <h2 className="font-serif font-extrabold text-base text-white tracking-wide">Instructor Portal</h2>
                <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">EduMOOC Studio</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5 px-3">
            <div className="px-3 py-1 text-[10px] font-bold text-blue-300/60 uppercase tracking-wider">
              Quản lý giảng dạy
            </div>

            <button
              onClick={() => onNavigate('instructor-dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                currentTab === 'instructor-dashboard'
                  ? 'bg-[#16324F] text-white font-bold border-l-4 border-amber-400 shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Bảng điều khiển & Khóa học</span>
            </button>

            <button
              onClick={() => onNavigate('instructor-create-course')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                currentTab === 'instructor-create-course'
                  ? 'bg-[#16324F] text-white font-bold border-l-4 border-emerald-400 shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Tạo khóa học mới</span>
            </button>

            <button
              onClick={() => onNavigate('instructor-course-editor')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                currentTab === 'instructor-course-editor'
                  ? 'bg-[#16324F] text-white font-bold border-l-4 border-blue-400 shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Edit3 className="w-4 h-4 text-blue-400" />
              <span>Soạn bài học & Đề cương</span>
            </button>

            <button
              onClick={() => onNavigate('instructor-quiz-builder')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                currentTab === 'instructor-quiz-builder'
                  ? 'bg-[#16324F] text-white font-bold border-l-4 border-purple-400 shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>Soạn đề thi Quiz</span>
            </button>

            <button
              onClick={() => onNavigate('instructor-student-progress')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                currentTab === 'instructor-student-progress'
                  ? 'bg-[#16324F] text-white font-bold border-l-4 border-cyan-400 shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Tiến độ học viên</span>
            </button>

            <button
              onClick={() => onNavigate('instructor-profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                currentTab === 'instructor-profile'
                  ? 'bg-[#16324F] text-white font-bold border-l-4 border-rose-400 shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <User className="w-4 h-4 text-rose-400" />
              <span>Hồ sơ cá nhân</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom: Instructor Profile & Logout */}
        <div className="px-4 border-t border-[#16324F] pt-4 space-y-3">
          <button
            onClick={() => onNavigate('instructor-profile')}
            className="w-full flex items-center gap-3 text-left p-2 rounded-xl bg-[#0A2540] hover:bg-[#16324F] transition-all border border-[#16324F] cursor-pointer"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
              alt={user?.fullName}
              className="w-9 h-9 rounded-full object-cover border-2 border-amber-400"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'TS. Nguyễn Văn A'}</p>
              <p className="text-[10px] text-amber-300 font-semibold">Giảng viên Chuyên môn →</p>
            </div>
          </button>

          <button
            onClick={logout}
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
              {currentTab === 'instructor-dashboard'
                ? 'Tổng quan & Khóa học'
                : currentTab === 'instructor-course-editor'
                ? 'Soạn thảo khóa học'
                : currentTab === 'instructor-quiz-builder'
                ? 'Biên soạn đề thi'
                : 'Theo dõi học viên'}
            </span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#EFEDF0] border border-[#E4E4E0] text-[#16324F] rounded-md hover:bg-[#E3E2E5] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Portal: Giảng viên</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-[#E4E4E0] rounded-lg shadow-sm py-1 z-50">
                <button
                  onClick={() => {
                    quickSwitchRole('ROLE_STUDENT');
                    onNavigate('student-explore');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-[#FAF9FC] text-[#1A1C1E]"
                >
                  <GraduationCap className="w-3.5 h-3.5" /> Giao diện Học viên
                </button>
                <button
                  onClick={() => {
                    quickSwitchRole('ROLE_INSTRUCTOR');
                    onNavigate('instructor-dashboard');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 font-bold text-[#16324F] bg-[#F4F3F6]"
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
        </header>

        {/* Dynamic View with Unified Page Transition */}
        <main key={currentTab} className="flex-1 animate-page-transition">
          {children}
        </main>

      </div>

    </div>
  );
};
