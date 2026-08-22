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
      
      {/* Fixed Left Sidebar for Instructor (Matching Stitch Design) */}
      <aside className="w-64 h-screen fixed left-0 top-0 border-r border-[#E4E4E0] bg-white flex flex-col justify-between py-6 z-40">
        <div>
          
          {/* Header Brand */}
          <div className="px-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#16324F] text-white flex items-center justify-center font-bold text-lg font-serif">
                E
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-[#001D37]">Instructor Portal</h2>
                <p className="text-[11px] text-[#5E5E5E]">Academic Management</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 px-3">
            <button
              onClick={() => onNavigate('instructor-dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'instructor-dashboard'
                  ? 'bg-[#16324F] text-white font-semibold'
                  : 'text-[#5E5E5E] hover:bg-[#FAF9FC] hover:text-[#1A1C1E]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Bảng điều khiển & Khóa học</span>
            </button>

            <button
              onClick={() => onNavigate('instructor-create-course')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'instructor-create-course'
                  ? 'bg-[#16324F] text-white font-semibold'
                  : 'text-[#5E5E5E] hover:bg-[#FAF9FC] hover:text-[#1A1C1E]'
              }`}
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Tạo khóa học mới</span>
            </button>

            <button
              onClick={() => onNavigate('instructor-course-editor')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'instructor-course-editor'
                  ? 'bg-[#16324F] text-white font-semibold'
                  : 'text-[#5E5E5E] hover:bg-[#FAF9FC] hover:text-[#1A1C1E]'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Soạn bài học & Đề cương</span>
            </button>

            <button
              onClick={() => onNavigate('instructor-quiz-builder')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'instructor-quiz-builder'
                  ? 'bg-[#16324F] text-white font-semibold'
                  : 'text-[#5E5E5E] hover:bg-[#FAF9FC] hover:text-[#1A1C1E]'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Soạn đề thi Quiz</span>
            </button>

            <button
              onClick={() => onNavigate('instructor-student-progress')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'instructor-student-progress'
                  ? 'bg-[#16324F] text-white font-semibold'
                  : 'text-[#5E5E5E] hover:bg-[#FAF9FC] hover:text-[#1A1C1E]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Tiến độ học viên</span>
            </button>

            <button
              onClick={() => onNavigate('instructor-profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'instructor-profile'
                  ? 'bg-[#16324F] text-white font-semibold'
                  : 'text-[#5E5E5E] hover:bg-[#FAF9FC] hover:text-[#1A1C1E]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Hồ sơ cá nhân</span>
            </button>
          </nav>

          {/* Create New Course Primary Button */}
          <div className="px-4 mt-6">
            <button
              onClick={onCreateCourse}
              className="w-full py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo khóa học mới</span>
            </button>
          </div>

        </div>

        {/* Sidebar Bottom: Instructor Profile & Logout */}
        <div className="px-4 border-t border-[#E4E4E0] pt-4 space-y-3">
          <button
            onClick={() => onNavigate('instructor-profile')}
            className="w-full flex items-center gap-3 text-left p-1.5 rounded-lg hover:bg-[#FAF9FC] transition-colors"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
              alt={user?.fullName}
              className="w-9 h-9 rounded-full object-cover border border-[#E4E4E0]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1A1C1E] truncate">{user?.fullName || 'TS. Nguyễn Văn A'}</p>
              <p className="text-[10px] text-[#16324F] font-semibold">Xem & Đổi hồ sơ →</p>
            </div>
          </button>

          <button
            onClick={logout}
            className="w-full py-1.5 px-3 bg-[#FFDAD6]/50 hover:bg-[#FFDAD6] text-[#BA1A1A] text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors"
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

        {/* Dynamic View */}
        <main className="flex-1">
          {children}
        </main>

      </div>

    </div>
  );
};
