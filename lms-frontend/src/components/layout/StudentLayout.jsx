import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Footer } from './Footer';
import { CategoryMegaMenu } from '../navigation/CategoryMegaMenu';
import { getImageUrl } from '../../utils/imageUrl';
import { UserMenuDropdown } from '../common/UserMenuDropdown';
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

export const StudentLayout = ({ currentTab: currentTabProp, onNavigate, onOpenAuthModal, children }) => {
  const { user, logout, currentRole, isAdmin, isInstructor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const pathname = location.pathname;

  const handleNav = (tab, query = '') => {
    if (onNavigate) {
      onNavigate(tab, query);
      return;
    }

    if (tab === 'student-explore' || tab === 'explore') {
      if (query && query !== 'all') {
        navigate(`/courses?category=${encodeURIComponent(query)}`);
      } else {
        navigate('/');
      }
    } else if (tab === 'student-course-listing' || tab === 'course-listing') {
      if (query) {
        navigate(`/courses?category=${encodeURIComponent(query)}`);
      } else {
        navigate('/courses');
      }
    } else if (tab === 'student-my-learning' || tab === 'my-learning') {
      navigate('/my-learning');
    } else if (tab === 'student-certificates' || tab === 'certificates') {
      navigate(isAdmin ? '/admin/certificates' : '/certificates');
    } else if (tab === 'student-profile' || tab === 'profile') {
      navigate('/profile');
    } else if (tab === 'instructor-dashboard') {
      navigate('/instructor/dashboard');
    } else if (tab === 'admin-overview') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  const isMyLearningActive = pathname.startsWith('/my-learning') || pathname.startsWith('/learn');
  const isCertificatesActive = isAdmin ? pathname.includes('/admin/certificates') : pathname.startsWith('/certificates');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9FC] text-[#1A1C1E]">
      
      {/* Student Top Navbar - High Contrast & Elevated Shadow */}
      <header className="bg-[#FAFAF8] sticky top-0 z-40 border-b border-[#E4E4E0] shadow-[0_2px_12px_rgba(0,29,55,0.06)]">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Student Nav */}
          <div className="flex items-center gap-8">
            <Link 
              to="/"
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
                  {isAdmin ? 'Quản trị viên' : isInstructor ? 'Giảng viên' : 'Học viên'}
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1.5">
              {/* Category Mega Menu (3-tier cascade) */}
              <CategoryMegaMenu 
                onSelectCategory={(query) => {
                  if (query && query !== 'all') {
                    navigate(`/courses?category=${encodeURIComponent(query)}`);
                  } else {
                    navigate('/courses');
                  }
                }} 
              />

              {user && (
                <Link
                  to="/my-learning"
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isMyLearningActive
                      ? 'text-[#16324F] bg-[#F4F3F6] font-bold shadow-2xs'
                      : 'text-[#1A1C1E] hover:text-[#16324F] hover:bg-[#FAF9FC]'
                  }`}
                >
                  Khóa học của tôi
                </Link>
              )}

              <Link
                to={isAdmin ? '/admin/certificates' : '/certificates'}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isCertificatesActive
                    ? 'text-[#16324F] bg-[#F4F3F6] font-bold shadow-2xs'
                    : 'text-[#1A1C1E] hover:text-[#16324F] hover:bg-[#FAF9FC]'
                }`}
              >
                {isAdmin ? 'Quản lý chứng chỉ' : 'Chứng chỉ & Xác thực'}
              </Link>

            </nav>
          </div>

          {/* Right Side: Demo Role Switcher & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-2 md:hidden text-[#1A1C1E] hover:bg-[#FAF9FC] rounded-lg cursor-pointer"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-[#16324F]" />
            </button>

            {/* Portal Badge */}
            {user && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#16324F] text-white rounded-md">
                <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                <span>Portal: Học viên</span>
              </div>
            )}

            {/* User Profile or Login CTA */}
            {user ? (
              <UserMenuDropdown />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#16324F] hover:bg-[#F4F3F6] rounded-md transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/login?mode=register"
                  className="px-3.5 py-1.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-md transition-colors shadow-2xs"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Responsive Overlay) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-200"
            onClick={() => setMobileDrawerOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-[#E4E4E0] flex items-center justify-between">
              <span className="font-serif font-bold text-lg text-[#001D37]">EduMOOC</span>
              <button 
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-md text-[#5E5E5E] hover:bg-[#FAF9FC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mobile Nav Links */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {user && (
                <button
                  onClick={() => {
                    navigate('/my-learning');
                    setMobileDrawerOpen(false);
                  }}
                  className="text-left text-xs font-semibold text-[#16324F] py-1.5 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" /> Khóa học của tôi
                </button>
              )}
              <button
                onClick={() => {
                  navigate(isAdmin ? '/admin/certificates' : '/certificates');
                  setMobileDrawerOpen(false);
                }}
                className="text-left text-xs font-semibold text-[#16324F] py-1.5 flex items-center gap-2"
              >
                <Award className="w-4 h-4" /> {isAdmin ? 'Quản lý chứng chỉ' : 'Chứng chỉ & Xác thực'}
              </button>
            </div>

            {/* Mobile Category Accordion */}
            <CategoryMegaMenu
              isMobile={true}
              onSelectCategory={(query) => {
                if (query && query !== 'all') {
                  navigate(`/courses?category=${encodeURIComponent(query)}`);
                } else {
                  navigate('/courses');
                }
                setMobileDrawerOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Outlet View with Page Transition */}
      <main key={pathname} className="flex-1 animate-page-transition">
        {children || <Outlet />}
      </main>

      {/* Global Academic Scholarly Footer */}
      <Footer />

    </div>
  );
};
