import React from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserMenuDropdown } from '../common/UserMenuDropdown';
import { NotificationBell } from '../common/NotificationBell';
import { 
  ShieldCheck, 
  Clock, 
  Users, 
  BarChart3, 
  LogOut, 
  ChevronRight, 
  LayoutDashboard,
  Layers,
  Database,
  User,
  TrendingUp,
  Award
} from 'lucide-react';

export const AdminLayout = ({ currentTab: currentTabProp, onNavigate, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname;

  const isOverview = pathname === '/admin/dashboard' || pathname === '/admin/overview' || pathname === '/admin';
  const isApproval = pathname.includes('/admin/courses/approval');
  const isUsers = pathname.includes('/admin/users');
  const isRevenue = pathname.includes('/admin/revenue');
  const isCertificates = pathname.includes('/admin/certificates');
  const isProfile = pathname.includes('/admin/profile');
  const isNotifications = pathname.includes('/admin/notifications');

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan hệ thống',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      active: isOverview,
    },
    {
      id: 'course-approval',
      label: 'Kiểm duyệt khóa học',
      icon: Clock,
      path: '/admin/courses/approval',
      active: isApproval,
    },
    {
      id: 'user-management',
      label: 'Quản trị người dùng',
      icon: Users,
      path: '/admin/users',
      active: isUsers,
    },
    {
      id: 'revenue-analytics',
      label: 'Doanh thu & Báo cáo',
      icon: TrendingUp,
      path: '/admin/revenue',
      active: isRevenue,
    },
    {
      id: 'certificates',
      label: 'Quản lý chứng chỉ',
      icon: Award,
      path: '/admin/certificates',
      active: isCertificates,
    },
    {
      id: 'admin-profile',
      label: 'Hồ sơ quản trị viên',
      icon: User,
      path: '/admin/profile',
      active: isProfile,
    },
  ];

  const handleNavClick = (item) => {
    if (onNavigate) {
      onNavigate(item.id);
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] text-[#1A1C1E] flex flex-col font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#001D37] text-white flex flex-col fixed inset-y-0 left-0 z-40 border-r border-[#002B4E]">
        
        {/* Brand / Logo */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-sm font-bold text-xl">
            E
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block">
              EduMOOC
            </span>
            <span className="text-[10px] text-blue-300 font-medium uppercase tracking-wider block">
              Admin Governance
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  item.active
                    ? 'bg-white/15 text-white font-semibold shadow-xs'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.active ? 'text-blue-400' : 'text-white/60'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions: Logout */}
        <div className="p-3 border-t border-white/10">
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
                : isCertificates
                ? 'Quản lý chứng chỉ'
                : isNotifications
                ? 'Trung tâm thông báo'
                : 'Hồ sơ cá nhân'}
            </span>
          </div>

          {/* Right Header: Role Badge & User Menu */}
          <div className="flex items-center gap-3">
            <NotificationBell />
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
