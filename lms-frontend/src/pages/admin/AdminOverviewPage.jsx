import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStats } from '../../hooks/useAdmin';
import { useAdminRevenueOverview } from '../../hooks/useAdminRevenue';
import { useCategories } from '../../hooks/useCourses';
import { formatCurrency } from '../../utils/format';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight 
} from 'lucide-react';

export const AdminOverviewPage = ({ onNavigateSubTab }) => {
  const navigate = useNavigate();
  const { data: apiStats, isLoading: loading } = useAdminStats();
  const { data: revenueOverview } = useAdminRevenueOverview();
  const { data: categories = [] } = useCategories();

  const stats = apiStats || {
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    publishedCourses: 0,
    pendingCourses: 0,
    totalEnrollments: 0,
    completedEnrollments: 0,
    completionRate: 0,
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] py-10 px-6">
      <div className="max-w-[1280px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F4F3F6] border border-[#E4E4E0] rounded-full text-xs font-semibold text-[#16324F] mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Quản trị Hệ thống Toàn diện</span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-[#001D37]">
              Tổng quan Hệ sinh thái EduMOOC
            </h1>
            <p className="text-xs text-[#5E5E5E] mt-1">
              Theo dõi các chỉ số vận hành thời gian thực, phê duyệt khóa học và quản trị phân quyền người dùng.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateSubTab ? onNavigateSubTab('course-approval') : navigate('/admin/courses/approval')}
              className="px-3.5 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Duyệt khóa học ({stats?.pendingCourses || 0})</span>
            </button>
            <button
              onClick={() => navigate('/admin/revenue')}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Báo cáo doanh thu</span>
            </button>
            <button
              onClick={() => onNavigateSubTab ? onNavigateSubTab('user-management') : navigate('/admin/users')}
              className="px-3.5 py-2 bg-white border border-[#E4E4E0] hover:bg-[#FAF9FC] text-[#1A1C1E] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Quản lý Users</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Users */}
          <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-[#5E5E5E]">
              <span className="text-xs font-semibold uppercase tracking-wider">Tổng người dùng</span>
              <Users className="w-5 h-5 text-[#16324F]" />
            </div>
            <div>
              <p className="text-3xl font-bold font-serif text-[#001D37]">{stats?.totalUsers || 0}</p>
              <p className="text-[11px] text-[#6B6B6B] mt-1">
                {stats?.totalStudents || 0} học viên • {stats?.totalInstructors || 0} giảng viên
              </p>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-[#5E5E5E]">
              <span className="text-xs font-semibold uppercase tracking-wider">Khóa học</span>
              <BookOpen className="w-5 h-5 text-[#16324F]" />
            </div>
            <div>
              <p className="text-3xl font-bold font-serif text-[#001D37]">{stats?.totalCourses || 0}</p>
              <p className="text-[11px] text-[#6B6B6B] mt-1">
                <span className="text-[#22C55E] font-semibold">{stats?.publishedCourses || 0} đã xuất bản</span> • {stats?.pendingCourses || 0} chờ duyệt
              </p>
            </div>
          </div>

          {/* Total Enrollments */}
          <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-[#5E5E5E]">
              <span className="text-xs font-semibold uppercase tracking-wider">Lượt ghi danh học</span>
              <GraduationCap className="w-5 h-5 text-[#16324F]" />
            </div>
            <div>
              <p className="text-3xl font-bold font-serif text-[#001D37]">{stats?.totalEnrollments || 0}</p>
              <p className="text-[11px] text-[#6B6B6B] mt-1">
                {stats?.completedEnrollments || 0} hoàn thành khóa
              </p>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-[#5E5E5E]">
              <span className="text-xs font-semibold uppercase tracking-wider">Tỷ lệ tốt nghiệp</span>
              <TrendingUp className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-3xl font-bold font-serif text-[#22C55E]">{stats?.completionRate || 0}%</p>
              <p className="text-[11px] text-[#6B6B6B] mt-1">Học viên đạt chứng chỉ số</p>
            </div>
          </div>

        </div>

        {/* System Health / Status info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#001D37]">Trạng thái Khóa học Cần kiểm duyệt</h3>
            {stats?.pendingCourses > 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">Có {stats.pendingCourses} khóa học đang chờ bạn phê duyệt</p>
                    <p className="text-[11px] text-amber-700">Kiểm tra nội dung chương trình học và đề thi trước khi xuất bản</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateSubTab ? onNavigateSubTab('course-approval') : navigate('/admin/courses/approval')}
                  className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-md hover:bg-amber-700 transition-colors cursor-pointer"
                >
                  Xử lý ngay
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#5E5E5E]">Hiện không có khóa học nào đang chờ phê duyệt.</p>
            )}
          </div>

          <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#001D37]">Chỉ số Vận hành & Tài chính Nền tảng</h3>
              <button
                onClick={() => navigate('/admin/revenue')}
                className="text-xs font-semibold text-[#16324F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Xem báo cáo</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="space-y-3 text-xs text-[#5E5E5E]">
              <div className="flex items-center justify-between py-1.5 border-b border-[#E4E4E0]">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tổng doanh thu toàn sàn:</span>
                </span>
                <span className="font-bold text-[#001D37]">
                  {revenueOverview?.totalGrossRevenue != null ? formatCurrency(revenueOverview.totalGrossRevenue) : '0₫'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#E4E4E0]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hoa hồng sàn tích lũy:</span>
                </span>
                <span className="font-bold text-emerald-700">
                  {revenueOverview?.totalPlatformCommission != null ? formatCurrency(revenueOverview.totalPlatformCommission) : '0₫'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#E4E4E0]">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Đơn hàng thanh toán thành công:</span>
                </span>
                <span className="font-semibold text-[#1A1C1E]">
                  {revenueOverview?.totalOrdersCount != null ? `${revenueOverview.totalOrdersCount.toLocaleString()} đơn hàng` : '0 đơn hàng'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#16324F]" />
                  <span>Chuyên mục & Lĩnh vực đào tạo:</span>
                </span>
                <span className="font-semibold text-[#1A1C1E]">
                  {categories.length > 0 ? `${categories.length} chuyên mục đang hoạt động` : '7 chuyên mục tiêu chuẩn'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
