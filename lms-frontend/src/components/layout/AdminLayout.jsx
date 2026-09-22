import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserMenuDropdown } from '../common/UserMenuDropdown';
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
  User,
  TrendingUp
} from 'lucide-react';

export const AdminLayout = ({ currentTab: currentTabProp, onNavigate, children }) => {
  const { user, logout, quickSwitchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const pathname = location.pathname;

  const isOverview = pathname === '/admin/dashboard' || pathname === '/admin/overview' || pathname === '/admin';
  const isApproval = pathname === '/admin/courses/approval' || pathname === '/admin/course-approval';
  const isUsers = pathname === '/admin/users' || pathname === '/admin/user-management';
  const isRevenue = pathname === '/admin/revenue';
  const isProfile = pathname === '/admin/profile';

  return (
    <div className="min-h-screen flex bg-[#F4F3F6] text-[#1A1C1E]">
      
      {/* Fixed Left Sidebar with Dark / Deep Navy Theme (Matching Stitch Admin Design) */}
      <aside className="w-64 h-screen fixed left-0 top-0 bg-[#001D37] text-white flex flex-col justify-between py-6 z-40 border-r border-[#16324F]">
        <div>
          
          {/* Header Brand */}
          <div className="px-6 mb-8">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#16324F] border border-blue-400/30 text-white flex items-center justify-center font-bold text-lg font-serif shadow-sm">
                <ShieldCheck className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-white tracking-wide">EduMOOC Admin</h2>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest">System Control</p>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5 px-3">
            <div className="px-3 py-1 text-[10px] font-bold text-blue-300/60 uppercase tracking-wider">
              Bảng quản trị
            </div>

            <Link
              to="/admin/dashboard"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isOverview
                  ? 'bg-[#16324F] text-white font-semibold border-l-4 border-blue-400 shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Tổng quan hệ thống</span>
            </Link>

            <Link
              to="/admin/courses/approval"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isApproval
                  ? 'bg-[#16324F] text-white font-semibold border-l-4 border-amber-400 shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Kiểm duyệt khóa học</span>
            </Link>

            <Link
              to="/admin/users"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isUsers
                  ? 'bg-[#16324F] text-white font-semibold border-l-4 border-emerald-400 shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Quản lý người dùng</span>
            </Link>

            <Link
              to="/admin/revenue"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isRevenue
                  ? 'bg-[#16324F] text-white font-semibold border-l-4 border-indigo-400 shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Doanh thu & Báo cáo</span>
            </Link>

            <Link
              to="/admin/profile"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isProfile
                  ? 'bg-[#16324F] text-white font-semibold border-l-4 border-blue-400 shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 text-blue-300" />
              <span>Hồ sơ cá nhân</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Bottom: Admin Profile & Logout */}
        <div className="px-4 border-t border-white/10 pt-4 space-y-3">
          <Link
            to="/admin/profile"
            className="w-full flex items-center gap-3 text-left p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-blue-900 border border-blue-400/40 flex items-center justify-center font-bold text-xs text-white">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Quản trị viên'}</p>
              <p className="text-[10px] text-blue-300 truncate">Xem & Đổi hồ sơ →</p>
            </div>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full py-1.5 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
              {isOverview
                ? 'Tổng quan hệ thống'
                : isApproval
                ? 'Kiểm duyệt khóa học'
                : isUsers
                ? 'Quản lý người dùng'
                : isRevenue
                ? 'Doanh thu & Báo cáo'
                : 'Hồ sơ cá nhân'}
            </span>
          </div>

          {/* Right Header: Role Badge & User Menu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#001D37] text-white rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Portal: Quản trị viên</span>
            </div>

            <UserMenuDropdown />
          </div>
        </header>

        {/* Dynamic Admin View with Unified Page Transition */}
        <main key={pathname} className="flex-1 animate-page-transition">
          {children || <Outlet />}
        </main>

      </div>

    </div>
  );
};
