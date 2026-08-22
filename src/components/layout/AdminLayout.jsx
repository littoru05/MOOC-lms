import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Clock, 
  Users, 
  BarChart3, 
  LogOut, 
  ChevronRight, 
  Sparkles,
  GraduationCap,
  LayoutDashboard,
  Shield,
  Layers,
  Database,
  User
} from 'lucide-react';

export const AdminLayout = ({ currentTab, onNavigate, children }) => {
  const { user, logout, quickSwitchRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F4F3F6] text-[#1A1C1E]">
      
      {/* Fixed Left Sidebar with Dark / Deep Navy Theme (Matching Stitch Admin Design) */}
      <aside className="w-64 h-screen fixed left-0 top-0 bg-[#001D37] text-white flex flex-col justify-between py-6 z-40 border-r border-[#16324F]">
        <div>
          
          {/* Header Brand */}
          <div className="px-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#16324F] border border-blue-400/30 text-white flex items-center justify-center font-bold text-lg font-serif shadow-sm">
                <ShieldCheck className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-white tracking-wide">EduMOOC Admin</h2>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest">System Control</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5 px-3">
            <div className="px-3 py-1 text-[10px] font-bold text-blue-300/60 uppercase tracking-wider">
              Bảng quản trị
            </div>

            <button
              onClick={() => onNavigate('admin-overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'admin-overview'
                  ? 'bg-[#16324F] text-white font-semibold border-l-4 border-blue-400 shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Tổng quan hệ thống</span>
            </button>

            <button
              onClick={() => onNavigate('admin-course-approval')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'admin-course-approval'
                  ? 'bg-[#16324F] text-white font-semibold border-l-4 border-amber-400 shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Kiểm duyệt khóa học</span>
            </button>

            <button
              onClick={() => onNavigate('admin-user-management')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'admin-user-management'
                  ? 'bg-[#16324F] text-white font-semibold border-l-4 border-emerald-400 shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Quản lý người dùng</span>
            </button>

            <button
              onClick={() => onNavigate('admin-profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'admin-profile'
                  ? 'bg-[#16324F] text-white font-semibold border-l-4 border-blue-400 shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 text-blue-300" />
              <span>Hồ sơ cá nhân</span>
            </button>
          </nav>

          {/* System Badge */}
          <div className="mx-4 mt-8 p-3 bg-white/5 border border-white/10 rounded-lg text-[11px] text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 text-blue-300 font-semibold text-xs">
              <Database className="w-3.5 h-3.5" />
              <span>MySQL 8.0 • Monolithic</span>
            </div>
            <p className="text-[10px] text-slate-400">11 Tables & Entities Active</p>
          </div>

        </div>

        {/* Sidebar Bottom: Admin Profile & Logout */}
        <div className="px-4 border-t border-white/10 pt-4 space-y-3">
          <button
            onClick={() => onNavigate('admin-profile')}
            className="w-full flex items-center gap-3 text-left p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-blue-900 border border-blue-400/40 flex items-center justify-center font-bold text-xs text-white">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Quản trị viên'}</p>
              <p className="text-[10px] text-blue-300 truncate">Xem & Đổi hồ sơ →</p>
            </div>
          </button>

          <button
            onClick={logout}
            className="w-full py-1.5 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E4E4E0] sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#5E5E5E]">
            <span className="font-semibold text-[#001D37]">EduMOOC Governance</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="capitalize text-[#1A1C1E]">
              {currentTab === 'admin-overview'
                ? 'Tổng quan hệ thống'
                : currentTab === 'admin-course-approval'
                ? 'Kiểm duyệt khóa học'
                : 'Quản lý người dùng'}
            </span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#001D37] text-white rounded-md hover:bg-[#16324F] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Portal: Quản trị viên</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-[#E4E4E0] rounded-lg shadow-sm py-1 z-50 text-[#1A1C1E]">
                <button
                  onClick={() => {
                    quickSwitchRole('ROLE_STUDENT');
                    onNavigate('student-explore');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-[#FAF9FC]"
                >
                  <GraduationCap className="w-3.5 h-3.5" /> Giao diện Học viên
                </button>
                <button
                  onClick={() => {
                    quickSwitchRole('ROLE_INSTRUCTOR');
                    onNavigate('instructor-dashboard');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-[#FAF9FC]"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" /> Portal Giảng viên
                </button>
                <button
                  onClick={() => {
                    quickSwitchRole('ROLE_ADMIN');
                    onNavigate('admin-overview');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 font-bold text-[#16324F] bg-[#F4F3F6]"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16324F]" /> Portal Quản trị viên
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Admin View */}
        <main className="flex-1">
          {children}
        </main>

      </div>

    </div>
  );
};
