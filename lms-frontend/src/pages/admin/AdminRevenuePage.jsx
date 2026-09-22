import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Percent, 
  Sparkles, 
  Calendar, 
  Award, 
  BookOpen, 
  Layers, 
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Area,
  ComposedChart,
  Line,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  useAdminRevenueOverview, 
  useAdminRevenueChart, 
  useInstructorRanking, 
  useTopCourses, 
  useCategoryRevenue, 
  useUserGrowth 
} from '../../hooks/useAdminRevenue';
import { formatCurrency } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUrl';
import { Pagination } from '../../components/common/Pagination';

// Bảng màu cho biểu đồ Donut danh mục
const CATEGORY_COLORS = ['#16324F', '#0D9488', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981'];

// Format trục Y dạng triệu đồng (tr ₫ / M ₫)
const formatYAxis = (val) => {
  if (!val || val === 0) return '0 ₫';
  if (val >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}B ₫`;
  }
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr ₫`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}k ₫`;
  }
  return `${val} ₫`;
};

// Tự động bù đắp timeline liên tục (tránh lỗi 1 điểm dữ liệu thành 3 chấm tròn rời rạc)
const fillTimelineData = (rawData = [], groupBy = 'month') => {
  if (!rawData || !Array.isArray(rawData)) return [];

  const dataMap = new Map();
  rawData.forEach(item => {
    if (item && item.period) {
      dataMap.set(String(item.period), item);
    }
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  const result = [];

  if (groupBy === 'month') {
    // Tạo ít nhất 6 tháng gần nhất tính đến tháng hiện tại
    let startYear = currentYear;
    let startMonth = currentMonth - 5;
    while (startMonth <= 0) {
      startMonth += 12;
      startYear -= 1;
    }

    // Nếu dữ liệu có mốc thời gian sớm hơn, mở rộng để bao phủ toàn bộ
    rawData.forEach(item => {
      if (item?.period && item.period.includes('-')) {
        const parts = item.period.split('-').map(Number);
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          const [y, m] = parts;
          if (y < startYear || (y === startYear && m < startMonth)) {
            startYear = y;
            startMonth = m;
          }
        }
      }
    });

    let iterYear = startYear;
    let iterMonth = startMonth;

    while (iterYear < currentYear || (iterYear === currentYear && iterMonth <= currentMonth)) {
      const periodKey = `${iterYear}-${String(iterMonth).padStart(2, '0')}`;
      if (dataMap.has(periodKey)) {
        result.push(dataMap.get(periodKey));
      } else {
        result.push({
          period: periodKey,
          grossRevenue: 0,
          platformCommission: 0,
          instructorPayout: 0,
          ordersCount: 0,
        });
      }
      iterMonth++;
      if (iterMonth > 12) {
        iterMonth = 1;
        iterYear++;
      }
    }
  } else if (groupBy === 'day') {
    // Tạo đủ 14 ngày gần nhất
    const daysCount = 14;
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const periodKey = `${y}-${m}-${day}`;

      if (dataMap.has(periodKey)) {
        result.push(dataMap.get(periodKey));
      } else {
        result.push({
          period: periodKey,
          grossRevenue: 0,
          platformCommission: 0,
          instructorPayout: 0,
          ordersCount: 0,
        });
      }
    }
  } else if (groupBy === 'year') {
    // Tạo ít nhất 3 năm gần nhất
    const rawYears = rawData.map(d => parseInt(d.period)).filter(y => !isNaN(y));
    const minYear = rawYears.length > 0 ? Math.min(...rawYears) : currentYear - 2;
    const startYear = Math.min(currentYear - 2, minYear);

    for (let y = startYear; y <= currentYear; y++) {
      const periodKey = String(y);
      if (dataMap.has(periodKey)) {
        result.push(dataMap.get(periodKey));
      } else {
        result.push({
          period: periodKey,
          grossRevenue: 0,
          platformCommission: 0,
          instructorPayout: 0,
          ordersCount: 0,
        });
      }
    }
  } else {
    return rawData;
  }

  return result;
};

export const AdminRevenuePage = () => {
  const [groupBy, setGroupBy] = useState('month'); // 'day' | 'month' | 'year'
  const [chartType, setChartType] = useState('auto'); // 'auto' | 'line' | 'bar'
  const [growthGroupBy, setGrowthGroupBy] = useState('month');
  const [instructorViewMode, setInstructorViewMode] = useState('chart'); // 'chart' | 'table'
  const [instructorPage, setInstructorPage] = useState(1);
  const INSTRUCTOR_PAGE_SIZE = 5;

  const { data: summary, isLoading: isSummaryLoading } = useAdminRevenueOverview();
  const { data: rawChartData = [], isLoading: isChartLoading } = useAdminRevenueChart(groupBy);
  const { data: instructorRankings = [], isLoading: isInstructorLoading } = useInstructorRanking();
  const { data: topCourses = [], isLoading: isTopCoursesLoading } = useTopCourses(10);
  const { data: categoryData = [], isLoading: isCategoryLoading } = useCategoryRevenue();
  const { data: userGrowth = [], isLoading: isGrowthLoading } = useUserGrowth(growthGroupBy);

  // Sắp xếp mặc định giảng viên giảm dần theo tổng doanh thu thực nhận
  const sortedInstructors = useMemo(() => {
    if (!instructorRankings || !Array.isArray(instructorRankings)) return [];
    return [...instructorRankings].sort((a, b) => (Number(b.totalRevenue) || 0) - (Number(a.totalRevenue) || 0));
  }, [instructorRankings]);

  // Phân trang cục bộ
  const paginatedInstructors = useMemo(() => {
    const startIndex = (instructorPage - 1) * INSTRUCTOR_PAGE_SIZE;
    return sortedInstructors.slice(startIndex, startIndex + INSTRUCTOR_PAGE_SIZE);
  }, [sortedInstructors, instructorPage]);

  const commissionPercent = summary?.platformCommissionRate 
    ? Math.round(Number(summary.platformCommissionRate) * 100) 
    : 20;
  const payoutPercent = 100 - commissionPercent;

  // Lấp đầy timeline dữ liệu để biểu đồ không bị cụt hoặc 1 chấm đơn lẻ
  const chartData = useMemo(() => {
    return fillTimelineData(rawChartData, groupBy);
  }, [rawChartData, groupBy]);

  // Đếm số điểm dữ liệu có phát sinh doanh thu thực tế
  const activePointsCount = useMemo(() => {
    return chartData.filter(p => Number(p.grossRevenue) > 0).length;
  }, [chartData]);

  // Tự động chuyển Grouped Bar Chart nếu điểm dữ liệu thực tế <= 2
  const effectiveChartType = useMemo(() => {
    if (chartType === 'auto') {
      return activePointsCount <= 2 ? 'bar' : 'line';
    }
    return chartType;
  }, [chartType, activePointsCount]);

  // Custom Tooltip cho Biểu đồ Doanh thu Admin
  const RevenueCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const gross = payload.find(p => p.dataKey === 'grossRevenue')?.value || 0;
      const commission = payload.find(p => p.dataKey === 'platformCommission')?.value || 0;
      const payout = payload.find(p => p.dataKey === 'instructorPayout')?.value || 0;
      const orders = payload[0]?.payload?.ordersCount;

      return (
        <div className="bg-[#001D37] text-white p-3.5 rounded-lg shadow-xl border border-slate-700 text-xs space-y-2.5 min-w-[220px]">
          <p className="font-bold text-slate-300 border-b border-slate-700/80 pb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Thời gian: {label}</span>
          </p>
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between gap-3 text-white font-semibold">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 shadow-xs"></span>
                <span>Doanh thu gộp:</span>
              </span>
              <span className="font-bold text-white">{formatCurrency(gross)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-emerald-400 font-semibold">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-xs"></span>
                <span>Hoa hồng sàn ({commissionPercent}%):</span>
              </span>
              <span>{formatCurrency(commission)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-violet-300 font-semibold">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shrink-0 shadow-xs"></span>
                <span>Chi trả GV ({payoutPercent}%):</span>
              </span>
              <span>{formatCurrency(payout)}</span>
            </div>
            {orders !== undefined && (
              <div className="flex items-center justify-between gap-3 text-slate-400 text-[11px] pt-1.5 border-t border-slate-800">
                <span>Số đơn thành công:</span>
                <span className="font-bold text-slate-200">{orders} đơn</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip cho Tăng trưởng học viên
  const GrowthCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#001D37] text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1 min-w-[150px]">
          <p className="font-bold text-slate-300 border-b border-slate-700 pb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>{label}</span>
          </p>
          <div className="flex items-center justify-between gap-3 text-blue-300 font-semibold pt-1">
            <span>Học viên mới:</span>
            <span className="font-bold text-white">+{payload[0]?.value} bạn</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip cho Horizontal Bar Giảng viên
  const InstructorBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#001D37] text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[190px]">
          <p className="font-bold text-amber-300 border-b border-slate-700 pb-1">{data.instructorName}</p>
          <div className="flex items-center justify-between gap-2 text-slate-300 text-[11px]">
            <span>Khóa đã bán:</span>
            <span className="font-bold text-white">{data.coursesSoldCount} lượt</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-slate-300">
            <span>Doanh thu gộp:</span>
            <span className="font-bold text-white">{formatCurrency(data.totalGrossRevenue)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-violet-400 font-semibold">
            <span>Thực nhận (80%):</span>
            <span>{formatCurrency(data.totalRevenue)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip cho Donut Danh mục
  const CategoryCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#001D37] text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1 min-w-[170px]">
          <p className="font-bold text-amber-400 border-b border-slate-700 pb-1">{data.categoryName}</p>
          <div className="flex justify-between gap-3 text-white pt-0.5">
            <span>Doanh thu:</span>
            <span className="font-bold">{formatCurrency(data.totalRevenue)}</span>
          </div>
          <div className="flex justify-between gap-3 text-slate-300 text-[11px]">
            <span>Khóa đã bán:</span>
            <span>{data.coursesSoldCount || 0} lượt</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-[#FAF9FC]">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Trung tâm Tài chính & Doanh thu Toàn sàn</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-[#001D37]">
            Báo cáo Doanh thu & Thương mại
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-1">
            Tổng quan doanh thu toàn sàn, phân bổ hoa hồng nền tảng ({commissionPercent}%), chi trả giảng viên ({payoutPercent}%) và phân tích tăng trưởng.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-[#FAF9FC] border border-[#E4E4E0] p-2.5 rounded-xl shadow-2xs">
          <Percent className="w-4 h-4 text-emerald-600" />
          <span className="text-[#5E5E5E]">Cơ cấu phân chia:</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            {commissionPercent}% Sàn
          </span>
          <span className="text-[#5E5E5E]">•</span>
          <span className="font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
            {payoutPercent}% Giảng viên
          </span>
        </div>
      </div>

      {/* 5 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Gross Revenue */}
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5E5E5E] uppercase tracking-wider">Doanh thu gộp</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-[#001D37]">
              {isSummaryLoading ? '...' : formatCurrency(summary?.totalGrossRevenue)}
            </h3>
            <span className="text-[10px] text-[#5E5E5E] font-medium">Toàn bộ đơn hoàn thành</span>
          </div>
        </div>

        {/* Platform Commission (20%) */}
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Hoa hồng sàn</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-emerald-600">
              {isSummaryLoading ? '...' : formatCurrency(summary?.totalPlatformCommission)}
            </h3>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              Giữ lại {commissionPercent}%
            </span>
          </div>
        </div>

        {/* Instructor Payout (80%) */}
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider">Chi trả Giảng viên</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-violet-700">
              {isSummaryLoading ? '...' : formatCurrency(summary?.totalInstructorPayout)}
            </h3>
            <span className="text-[10px] text-violet-700 font-bold bg-violet-50 px-1.5 py-0.5 rounded">
              Chi trả {payoutPercent}%
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5E5E5E] uppercase tracking-wider">Tổng đơn hàng</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-[#001D37]">
              {isSummaryLoading ? '...' : (summary?.totalOrdersCount || 0)}
            </h3>
            <span className="text-[10px] text-[#5E5E5E] font-medium">Đơn thanh toán thành công</span>
          </div>
        </div>

        {/* Total Students Buying */}
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5E5E5E] uppercase tracking-wider">Học viên mua hàng</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-[#001D37]">
              {isSummaryLoading ? '...' : (summary?.totalStudentsCount || 0)}
            </h3>
            <span className="text-[10px] text-[#5E5E5E] font-medium">Học viên trả phí (Distinct)</span>
          </div>
        </div>
      </div>

      {/* Row 1: Biểu đồ Doanh thu toàn nền tảng */}
      <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E4E4E0]">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#16324F]" />
              <h3 className="text-base font-bold font-serif text-[#001D37]">
                Biến động Doanh thu & Dòng tiền Sàn
              </h3>
              {activePointsCount <= 2 && chartType === 'auto' && (
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Tối ưu Cột Ghép ({chartData.length} mốc)
                </span>
              )}
            </div>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              So sánh Doanh thu gộp, Hoa hồng sàn giữ lại ({commissionPercent}%) và Dòng tiền chi trả Giảng viên ({payoutPercent}%).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {/* Chart Type Toggle */}
            <div className="inline-flex bg-[#FAF9FC] p-1 rounded-lg border border-[#E4E4E0] text-xs">
              <button
                type="button"
                onClick={() => setChartType('line')}
                className={`px-2.5 py-1 font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  effectiveChartType === 'line'
                    ? 'bg-[#16324F] text-white shadow-2xs'
                    : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                }`}
                title="Biểu đồ đường mờ diện tích (Area & Line)"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Biểu đồ đường</span>
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  effectiveChartType === 'bar'
                    ? 'bg-[#16324F] text-white shadow-2xs'
                    : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                }`}
                title="Biểu đồ cột ghép đôi/ba so sánh trực quan"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Biểu đồ cột</span>
              </button>
            </div>

            {/* GroupBy Period Switcher */}
            <div className="inline-flex bg-[#FAF9FC] p-1 rounded-lg border border-[#E4E4E0] text-xs">
              {['day', 'month', 'year'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGroupBy(type)}
                  className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                    groupBy === type
                      ? 'bg-[#16324F] text-white shadow-2xs'
                      : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                  }`}
                >
                  {type === 'day' ? 'Theo Ngày' : type === 'month' ? 'Theo Tháng' : 'Theo Năm'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isChartLoading ? (
          <div className="h-72 flex items-center justify-center text-xs text-[#5E5E5E]">
            Đang tải dữ liệu biểu đồ...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-[#FAF9FC] rounded-xl border border-dashed border-[#E4E4E0] space-y-2">
            <Calendar className="w-8 h-8 text-[#A0A0A0] opacity-50" />
            <p className="text-xs font-bold text-[#001D37]">Chưa có dữ liệu giao dịch trong khoảng thời gian này</p>
            <p className="text-[11px] text-[#6B6B6B]">Dữ liệu biến động sẽ hiển thị khi hệ thống ghi nhận các đơn hàng thành công.</p>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {effectiveChartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E0" />
                  <XAxis dataKey="period" stroke="#8E8E93" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#8E8E93"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatYAxis}
                  />
                  <Tooltip content={<RevenueCustomTooltip />} cursor={false} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    formatter={(value) => {
                      if (value === 'grossRevenue') return 'Doanh thu gộp';
                      if (value === 'platformCommission') return `Hoa hồng sàn (${commissionPercent}%)`;
                      if (value === 'instructorPayout') return `Chi trả Giảng viên (${payoutPercent}%)`;
                      return value;
                    }}
                  />
                  <Bar dataKey="grossRevenue" fill="#16324F" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="instructorPayout" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="platformCommission" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              ) : (
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="grossRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16324F" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#16324F" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E0" />
                  <XAxis dataKey="period" stroke="#8E8E93" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#8E8E93"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatYAxis}
                  />
                  <Tooltip content={<RevenueCustomTooltip />} cursor={false} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    formatter={(value) => {
                      if (value === 'grossRevenue') return 'Doanh thu gộp';
                      if (value === 'platformCommission') return `Hoa hồng sàn (${commissionPercent}%)`;
                      if (value === 'instructorPayout') return `Chi trả Giảng viên (${payoutPercent}%)`;
                      return value;
                    }}
                  />
                  {/* Dải mờ Gradient Fill bên dưới Doanh thu gộp */}
                  <Area
                    type="monotone"
                    dataKey="grossRevenue"
                    fill="url(#grossRevenueGradient)"
                    stroke="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="grossRevenue"
                    stroke="#16324F"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#16324F', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="platformCommission"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#10B981', stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 5.5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="instructorPayout"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 5.5 }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Row 2: Chia đều 2 Biểu đồ (50% - 50%) - Xếp hạng Giảng viên & Donut Danh mục */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left: Xếp hạng Doanh thu theo Giảng viên */}
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-5 flex flex-col justify-between min-h-[420px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E4E0]">
            <div>
              <h3 className="text-base font-bold font-serif text-[#001D37] flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Xếp hạng Doanh thu theo Giảng viên</span>
              </h3>
              <p className="text-xs text-[#5E5E5E] mt-0.5">
                Các giảng viên có lượng khóa học bán chạy và thu nhập cao nhất.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#16324F] bg-blue-50 px-2.5 py-1 rounded-md">
                {instructorRankings.length} Giảng viên
              </span>
              <div className="inline-flex bg-[#FAF9FC] p-0.5 rounded-lg border border-[#E4E4E0]">
                <button
                  type="button"
                  onClick={() => setInstructorViewMode('chart')}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded cursor-pointer ${
                    instructorViewMode === 'chart'
                      ? 'bg-[#16324F] text-white'
                      : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                  }`}
                  title="Xem dạng biểu đồ cột ngang"
                >
                  Biểu đồ
                </button>
                <button
                  type="button"
                  onClick={() => setInstructorViewMode('table')}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded cursor-pointer ${
                    instructorViewMode === 'table'
                      ? 'bg-[#16324F] text-white'
                      : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                  }`}
                  title="Xem dạng bảng chi tiết"
                >
                  Bảng
                </button>
              </div>
            </div>
          </div>

          {isInstructorLoading ? (
            <div className="h-64 flex items-center justify-center text-xs text-[#5E5E5E]">
              Đang tải bảng xếp hạng...
            </div>
          ) : instructorRankings.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[#FAF9FC] rounded-xl border border-dashed border-[#E4E4E0] space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-[#001D37]">Chưa có số liệu doanh thu giảng viên</p>
              <p className="text-[11px] text-[#6B6B6B] max-w-xs">
                Bảng xếp hạng sẽ tự động tổng hợp khi học viên hoàn tất mua khóa học của giảng viên.
              </p>
            </div>
          ) : instructorViewMode === 'chart' ? (
            <div className="space-y-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={instructorRankings.slice(0, 5)}
                    margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E4E4E0" />
                    <XAxis type="number" stroke="#8E8E93" fontSize={11} tickFormatter={formatYAxis} />
                    <YAxis
                      type="category"
                      dataKey="instructorName"
                      stroke="#1A1C1E"
                      fontSize={11}
                      tickLine={false}
                      width={120}
                      tickFormatter={(val) => val?.length > 14 ? `${val.substring(0, 13)}...` : val}
                    />
                    <Tooltip content={<InstructorBarTooltip />} cursor={false} />
                    <Bar dataKey="totalGrossRevenue" name="Doanh thu gộp" fill="#16324F" radius={[0, 4, 4, 0]} maxBarSize={18} />
                    <Bar dataKey="totalRevenue" name="Thực nhận (80%)" fill="#8B5CF6" radius={[0, 4, 4, 0]} maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tóm tắt danh sách giảng viên dẫn đầu */}
              <div className="space-y-2 pt-1 border-t border-[#E4E4E0]">
                {instructorRankings.slice(0, 3).map((inst, idx) => (
                  <div key={inst.instructorId} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#FAF9FC]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-bold text-[10px] ${
                        idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-[#1A1C1E] truncate">{inst.instructorName}</span>
                      <span className="text-[11px] text-[#5E5E5E] shrink-0 font-medium">{inst.coursesSoldCount} lượt</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-violet-700">{formatCurrency(inst.totalRevenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9FC] border-b border-[#E4E4E0] text-[#5E5E5E] font-semibold">
                    <th className="py-2.5 px-3">Hạng</th>
                    <th className="py-2.5 px-3">Giảng viên</th>
                    <th className="py-2.5 px-3 text-center">Khóa đã bán</th>
                    <th className="py-2.5 px-3 text-right">Doanh thu gộp</th>
                    <th className="py-2.5 px-3 text-right">Thực nhận (80%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E0] transition-opacity duration-200">
                  {paginatedInstructors.map((inst, idx) => {
                    const rankNumber = (instructorPage - 1) * INSTRUCTOR_PAGE_SIZE + idx + 1;
                    return (
                      <tr key={inst.instructorId} className="hover:bg-[#FAF9FC] transition-colors">
                        <td className="py-2.5 px-3 font-bold text-[#16324F]">
                          {rankNumber}
                        </td>
                        <td className="py-2.5 px-3 flex items-center gap-2">
                          <img
                            src={getImageUrl(inst.avatarUrl, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')}
                            alt={inst.instructorName}
                            className="w-6 h-6 rounded-full object-cover border border-[#E4E4E0] shrink-0"
                          />
                          <span className="font-semibold text-[#1A1C1E] truncate max-w-[130px]">{inst.instructorName}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-[#1A1C1E]">
                          {inst.coursesSoldCount} lượt
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-[#5E5E5E]">
                          {formatCurrency(inst.totalGrossRevenue)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-violet-700">
                          {formatCurrency(inst.totalRevenue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Thanh phân trang client-side */}
              <Pagination
                currentPage={instructorPage}
                totalItems={sortedInstructors.length}
                pageSize={INSTRUCTOR_PAGE_SIZE}
                onPageChange={(p) => setInstructorPage(p)}
                className="rounded-b-xl border-t border-[#E4E4E0]"
              />
            </div>
          )}
        </div>

        {/* Right: Cơ cấu Doanh thu theo Danh mục (Donut / Pie Chart) */}
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-5 flex flex-col justify-between min-h-[420px]">
          <div className="pb-3 border-b border-[#E4E4E0]">
            <h3 className="text-base font-bold font-serif text-[#001D37] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#16324F]" />
              <span>Cơ cấu Doanh thu theo Danh mục</span>
            </h3>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              Tỷ trọng doanh số tạo ra theo từng nhóm chuyên môn đào tạo.
            </p>
          </div>

          {isCategoryLoading ? (
            <div className="h-64 flex items-center justify-center text-xs text-[#5E5E5E]">
              Đang tải dữ liệu danh mục...
            </div>
          ) : categoryData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[#FAF9FC] rounded-xl border border-dashed border-[#E4E4E0] space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-[#001D37]">Chưa có giao dịch theo danh mục</p>
              <p className="text-[11px] text-[#6B6B6B] max-w-xs">
                Tỷ trọng thị phần sẽ xuất hiện khi có giao dịch thanh toán thành công theo môn học.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Donut Chart */}
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="totalRevenue"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CategoryCustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-[#6B6B6B]">Danh mục</span>
                  <span className="text-xs font-extrabold text-[#001D37]">{categoryData.length} nhóm</span>
                </div>
              </div>

              {/* Danh sách phân bổ chi tiết danh mục */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {categoryData.map((cat, idx) => {
                  const totalAll = summary?.totalGrossRevenue && Number(summary.totalGrossRevenue) > 0 
                    ? Number(summary.totalGrossRevenue) 
                    : 1;
                  const percent = Math.min(100, Math.round((Number(cat.totalRevenue || 0) / totalAll) * 100));
                  const catColor = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

                  return (
                    <div key={cat.categoryId} className="p-2.5 rounded-lg bg-[#FAF9FC] border border-[#E4E4E0] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#1A1C1E] flex items-center gap-2 truncate">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: catColor }}></span>
                          <span className="truncate">{cat.categoryName}</span>
                        </span>
                        <span className="font-bold text-[#16324F] shrink-0">{formatCurrency(cat.totalRevenue)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#5E5E5E]">
                        <span>{cat.coursesSoldCount || 0} khóa đã bán</span>
                        <span className="font-bold text-emerald-600">{percent}% doanh thu sàn</span>
                      </div>
                      <div className="w-full bg-[#E4E4E0] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: catColor }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: 2 Columns - Top Khóa học Bán chạy & Tăng trưởng User (Chia đều 50% - 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left: Top Khóa học bán chạy */}
        <div className="bg-white border border-[#E4E4E0] rounded-xl overflow-hidden shadow-xs min-h-[420px] flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-[#E4E4E0]">
              <h3 className="text-base font-bold font-serif text-[#001D37] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#16324F]" />
                <span>Top Khóa học Bán chạy nhất</span>
              </h3>
              <p className="text-xs text-[#5E5E5E] mt-0.5">
                Danh sách các khóa học tạo ra doanh số cao nhất trên toàn hệ thống.
              </p>
            </div>

            {isTopCoursesLoading ? (
              <div className="p-8 text-center text-xs text-[#5E5E5E]">Đang tải danh sách khóa học...</div>
            ) : topCourses.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[#FAF9FC] space-y-2">
                <BookOpen className="w-8 h-8 text-[#A0A0A0] opacity-50" />
                <p className="text-xs font-bold text-[#001D37]">Chưa có dữ liệu khóa học đã bán</p>
                <p className="text-[11px] text-[#6B6B6B]">Dữ liệu khóa học bán chạy sẽ hiển thị khi có lượt đăng ký thanh toán.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E4E4E0]">
                {topCourses.map((c, idx) => (
                  <div key={c.courseId} className="p-3.5 px-6 flex items-center justify-between gap-4 hover:bg-[#FAF9FC] transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <img
                        src={getImageUrl(c.thumbnailUrl, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150')}
                        alt={c.title}
                        className="w-12 h-10 rounded-lg object-cover border border-[#E4E4E0] shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#1A1C1E] truncate max-w-xs" title={c.title}>
                          {c.title}
                        </h4>
                        <p className="text-[11px] text-[#5E5E5E] truncate">
                          Giảng viên: <span className="font-semibold">{c.instructorName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-[#16324F]">{formatCurrency(c.totalRevenue)}</p>
                      <p className="text-[11px] text-emerald-600 font-semibold">{c.totalSold} lượt mua</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Tăng trưởng Học viên mới */}
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-5 min-h-[420px] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E0]">
            <div>
              <h3 className="text-base font-bold font-serif text-[#001D37] flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Tăng trưởng Học viên Mới</span>
              </h3>
              <p className="text-xs text-[#5E5E5E] mt-0.5">
                Số lượng tài khoản học viên đăng ký mới theo thời gian.
              </p>
            </div>

            <div className="inline-flex bg-[#FAF9FC] p-1 rounded-lg border border-[#E4E4E0]">
              {['month', 'year'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGrowthGroupBy(type)}
                  className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                    growthGroupBy === type
                      ? 'bg-[#16324F] text-white shadow-2xs'
                      : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                  }`}
                >
                  {type === 'month' ? 'Theo Tháng' : 'Theo Năm'}
                </button>
              ))}
            </div>
          </div>

          {isGrowthLoading ? (
            <div className="h-64 flex items-center justify-center text-xs text-[#5E5E5E]">
              Đang tải tăng trưởng người dùng...
            </div>
          ) : userGrowth.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[#FAF9FC] rounded-xl border border-dashed border-[#E4E4E0] space-y-2">
              <Users className="w-8 h-8 text-[#A0A0A0] opacity-50" />
              <p className="text-xs font-bold text-[#001D37]">Chưa ghi nhận học viên mới</p>
              <p className="text-[11px] text-[#6B6B6B]">Dữ liệu học viên đăng ký mới sẽ được tổng hợp tự động.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowth} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E0" />
                  <XAxis dataKey="period" stroke="#8E8E93" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8E8E93" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<GrowthCustomTooltip />} cursor={false} />
                  <Bar
                    dataKey="newStudentsCount"
                    name="Học viên mới"
                    fill="#16324F"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
