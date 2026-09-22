import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Percent,
  Sparkles,
  BarChart3,
  BookOpen,
  Award,
  Table as TableIcon,
  Inbox,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  useRevenueSummary,
  useRevenueChart,
  useRevenueByCourse
} from '../../hooks/useInstructorRevenue';
import { formatCurrency } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUrl';
import { Pagination } from '../../components/common/Pagination';

// Format Y-axis compactly (e.g., 0 ₫, 500k ₫, 1 tr ₫, 2 tr ₫)
const formatYAxis = (val) => {
  if (!val || val === 0) return '0 ₫';
  if (Math.abs(val) >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}B ₫`;
  }
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr ₫`;
  }
  if (Math.abs(val) >= 1_000) {
    return `${(val / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}k ₫`;
  }
  return `${val} ₫`;
};

// Auto-fill timeline to prevent 1-dot bug
const fillInstructorTimelineData = (rawData, groupBy) => {
  if (!rawData || !Array.isArray(rawData)) return [];
  if (groupBy === 'year') return rawData;

  const map = new Map();
  rawData.forEach((item) => {
    map.set(item.period, item);
    if (typeof item.period === 'string' && item.period.includes('/')) {
      const parts = item.period.split('/');
      if (parts.length === 2) {
        map.set(`${parts[1]}-${parts[0].padStart(2, '0')}`, item);
      }
    }
    if (typeof item.period === 'string' && item.period.includes('-')) {
      const parts = item.period.split('-');
      if (parts.length === 2) {
        map.set(`${parts[1]}/${parts[0]}`, item);
      }
    }
  });

  const now = new Date();
  const result = [];

  if (groupBy === 'month') {
    const isSlashFormat = rawData.some((d) => typeof d.period === 'string' && d.period.includes('/'));
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let iterYear = currentYear;
    let iterMonth = currentMonth - 11;
    while (iterMonth <= 0) {
      iterMonth += 12;
      iterYear -= 1;
    }

    for (let i = 0; i < 12; i++) {
      const dashKey = `${iterYear}-${String(iterMonth).padStart(2, '0')}`;
      const slashKey = `${String(iterMonth).padStart(2, '0')}/${iterYear}`;
      const primaryKey = isSlashFormat ? slashKey : dashKey;

      if (map.has(dashKey) || map.has(slashKey) || map.has(primaryKey)) {
        const existing = map.get(primaryKey) || map.get(dashKey) || map.get(slashKey);
        result.push(existing);
      } else {
        result.push({
          period: primaryKey,
          netRevenue: 0,
          ordersCount: 0,
        });
      }

      iterMonth++;
      if (iterMonth > 12) {
        iterMonth = 1;
        iterYear++;
      }
    }

    const firstDataIndex = result.findIndex((d) => (d.netRevenue || 0) > 0 || (d.ordersCount || 0) > 0);
    if (firstDataIndex === -1 || firstDataIndex >= 6) {
      return result.slice(-6);
    }
    return result;
  }

  if (groupBy === 'day') {
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const periodKey = d.toISOString().slice(0, 10);
      if (map.has(periodKey)) {
        result.push(map.get(periodKey));
      } else {
        result.push({
          period: periodKey,
          netRevenue: 0,
          ordersCount: 0,
        });
      }
    }
    return result;
  }

  return rawData;
};

export const InstructorRevenuePage = () => {
  const [groupBy, setGroupBy] = useState('month'); // 'day' | 'month' | 'year'
  const [chartMode, setChartMode] = useState('bar'); // Mặc định mở tab doanh thu tự focus vào biểu đồ cột
  const [courseViewMode, setCourseViewMode] = useState('table'); // 'table' | 'chart'

  const { data: summary, isLoading: isSummaryLoading } = useRevenueSummary();
  const { data: rawChartData, isLoading: isChartLoading } = useRevenueChart(groupBy);
  const { data: coursesData, isLoading: isCoursesLoading } = useRevenueByCourse();

  // Client-side pagination state for courses table (5 items / page)
  const [coursePage, setCoursePage] = useState(1);
  const COURSE_PAGE_SIZE = 5;

  // Sắp xếp mặc định giảm dần theo thu nhập thực nhận (netRevenue)
  const sortedCourses = useMemo(() => {
    if (!coursesData || !Array.isArray(coursesData)) return [];
    return [...coursesData].sort((a, b) => (Number(b.netRevenue) || 0) - (Number(a.netRevenue) || 0));
  }, [coursesData]);

  // Phân trang cục bộ
  const paginatedCourses = useMemo(() => {
    const startIndex = (coursePage - 1) * COURSE_PAGE_SIZE;
    return sortedCourses.slice(startIndex, startIndex + COURSE_PAGE_SIZE);
  }, [sortedCourses, coursePage]);

  const commissionPercent = summary?.platformCommissionRate
    ? Math.round(Number(summary.platformCommissionRate) * 100)
    : 20;
  const netSharePercent = 100 - commissionPercent;

  // Process timeline data with zero-filling
  const chartData = useMemo(() => {
    return fillInstructorTimelineData(rawChartData, groupBy);
  }, [rawChartData, groupBy]);

  // Determine whether to use Bar chart in smart mode
  const activePointsCount = useMemo(() => {
    return (rawChartData || []).filter((d) => (d.netRevenue || 0) > 0).length;
  }, [rawChartData]);

  const effectiveChartMode = useMemo(() => {
    if (chartMode === 'smart') {
      return activePointsCount <= 3 ? 'bar' : 'area';
    }
    return chartMode;
  }, [chartMode, activePointsCount]);

  // Export CSV
  const handleExportCSV = () => {
    if (!chartData || chartData.length === 0) return;
    const headers = ['Thời gian', 'Thu nhập thực nhận (VND)', 'Số đơn hàng'];
    const rows = chartData.map((d) => [
      d.period,
      d.netRevenue || 0,
      d.ordersCount || 0,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `instructor_revenue_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-14">

      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E4E4E0] p-6 rounded-2xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Thu nhập & Quyền lợi Giảng viên</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-[#001D37]">
            Thu nhập của bạn
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-1">
            Theo dõi tổng số lượt bán và thu nhập thực nhận (sau khi khấu trừ {commissionPercent}% phí nền tảng).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-[#E4E4E0] px-3 py-2 rounded-xl">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span className="text-[#5E5E5E]">Tỷ lệ thực nhận:</span>
            <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
              {netSharePercent}% Thực nhận
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-medium rounded-xl shadow-xs transition-colors"
          >
            <Download size={14} />
            Xuất CSV
          </button>
        </div>
      </div>

      {/* 2. 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: Tổng khóa học đã bán */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-[#16324F] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5E5E5E] uppercase tracking-wider">Khóa học đã bán</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {isSummaryLoading ? (
              <div className="h-9 w-24 bg-slate-200 animate-pulse rounded-lg" />
            ) : (
              <h3 className="text-3xl font-extrabold font-serif text-[#001D37]">
                {(summary?.totalCoursesSold || 0).toLocaleString('vi-VN')}
                <span className="text-xs font-normal text-[#5E5E5E] ml-1.5 font-sans">lượt mua</span>
              </h3>
            )}
            <p className="text-[11px] text-[#5E5E5E] mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đơn hàng trạng thái hoàn tất (Completed)</span>
            </p>
          </div>
        </div>

        {/* Card 2: Thu nhập của bạn (Net) */}
        <div className="bg-gradient-to-br from-[#001D37] to-[#16324F] text-white rounded-2xl p-6 shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Thu nhập của bạn</span>
            <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {isSummaryLoading ? (
              <div className="h-9 w-36 bg-white/20 animate-pulse rounded-lg" />
            ) : (
              <h3 className="text-3xl font-extrabold font-serif text-white tracking-tight">
                {formatCurrency(summary?.totalNetRevenue || 0)}
              </h3>
            )}
            <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
              <span>Sau khi trừ {commissionPercent}% phí nền tảng</span>
            </p>
          </div>
        </div>

        {/* Card 3: Số học viên đã mua */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-[#16324F] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5E5E5E] uppercase tracking-wider">Học viên đã mua</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {isSummaryLoading ? (
              <div className="h-9 w-20 bg-slate-200 animate-pulse rounded-lg" />
            ) : (
              <h3 className="text-3xl font-extrabold font-serif text-[#001D37]">
                {(summary?.totalStudentsCount || 0).toLocaleString('vi-VN')}
                <span className="text-xs font-normal text-[#5E5E5E] ml-1.5 font-sans">học viên</span>
              </h3>
            )}
            <p className="text-[11px] text-[#5E5E5E] mt-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>Số lượng tài khoản riêng biệt</span>
            </p>
          </div>
        </div>

      </div>

      {/* 3. Main Chart Section: Gradient Area & Smart Bar */}
      <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 md:p-8 shadow-xs space-y-6">

        {/* Chart Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E4E0]">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#001D37] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#16324F]" />
              <span>Biểu đồ tăng trưởng thu nhập</span>
            </h2>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              Xu hướng thu nhập thực nhận qua từng khoảng thời gian
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Chart Mode Toggle */}
            <div className="inline-flex bg-[#FAF9FC] p-1 border border-[#E4E4E0] rounded-xl self-start sm:self-center">

              <button
                type="button"
                onClick={() => setChartMode('area')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  chartMode === 'area'
                    ? 'bg-[#16324F] text-white shadow-xs'
                    : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Biểu đồ đường</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('bar')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  chartMode === 'bar'
                    ? 'bg-[#16324F] text-white shadow-xs'
                    : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Biểu đồ cột</span>
              </button>
            </div>

            {/* GroupBy Buttons: Day / Month / Year */}
            <div className="inline-flex bg-[#FAF9FC] p-1 border border-[#E4E4E0] rounded-xl self-start sm:self-center">
              <button
                type="button"
                onClick={() => setGroupBy('day')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  groupBy === 'day'
                    ? 'bg-[#16324F] text-white shadow-xs'
                    : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                }`}
              >
                Theo Ngày
              </button>
              <button
                type="button"
                onClick={() => setGroupBy('month')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  groupBy === 'month'
                    ? 'bg-[#16324F] text-white shadow-xs'
                    : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                }`}
              >
                Theo Tháng
              </button>
              <button
                type="button"
                onClick={() => setGroupBy('year')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  groupBy === 'year'
                    ? 'bg-[#16324F] text-white shadow-xs'
                    : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                }`}
              >
                Theo Năm
              </button>
            </div>
          </div>
        </div>

        {/* Legend indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-[#1A1C1E] font-medium">Thu nhập thực nhận (Net Revenue)</span>
        </div>

        {/* Chart Canvas */}
        <div className="w-full h-80">
          {isChartLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl">
              <div className="flex flex-col items-center gap-2 text-xs text-slate-500">
                <div className="w-7 h-7 border-2 border-[#16324F] border-t-transparent rounded-full animate-spin" />
                <span>Đang tải số liệu biểu đồ...</span>
              </div>
            </div>
          ) : !chartData || chartData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 gap-2">
              <Inbox className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-medium">Chưa có dữ liệu thu nhập trong khoảng thời gian này</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {effectiveChartMode === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    stroke="#CBD5E1"
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    stroke="#CBD5E1"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatYAxis}
                  />
                  <Tooltip content={<CustomInstructorTooltip />} cursor={false} />
                  <Bar
                    dataKey="netRevenue"
                    fill="#10B981"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              ) : (
                <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="instructorNetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    stroke="#CBD5E1"
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    stroke="#CBD5E1"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatYAxis}
                  />
                  <Tooltip content={<CustomInstructorTooltip />} cursor={false} />
                  <Area
                    type="monotone"
                    dataKey="netRevenue"
                    stroke="none"
                    fill="url(#instructorNetGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="netRevenue"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#10B981', strokeWidth: 1.5, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* 4. Courses Revenue Section (Table & Horizontal Bar Chart View Toggle) */}
      <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E4E0]">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#001D37] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#16324F]" />
              <span>Chi tiết thu nhập theo từng khóa học</span>
            </h2>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              Danh sách khóa học sắp xếp giảm dần theo thu nhập nhận được
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#5E5E5E] font-medium hidden sm:inline">
              Tổng cộng: <strong className="text-[#1A1C1E]">{coursesData?.length || 0}</strong> khóa học
            </span>

            {/* View Mode Toggle: Table / Horizontal Bar Chart */}
            <div className="inline-flex bg-[#FAF9FC] p-1 border border-[#E4E4E0] rounded-xl">
              <button
                type="button"
                onClick={() => setCourseViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-all ${courseViewMode === 'table'
                  ? 'bg-[#16324F] text-white shadow-xs'
                  : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                  }`}
                title="Xem dạng Bảng chi tiết"
              >
                <TableIcon size={15} />
              </button>
              <button
                type="button"
                onClick={() => setCourseViewMode('chart')}
                className={`p-1.5 rounded-lg text-xs transition-all ${courseViewMode === 'chart'
                  ? 'bg-[#16324F] text-white shadow-xs'
                  : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                  }`}
                title="Xem dạng Biểu đồ cột ngang"
              >
                <Award size={15} />
              </button>
            </div>
          </div>
        </div>

        {isCoursesLoading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : !coursesData || coursesData.length === 0 ? (
          <div className="py-16 text-center text-[#6B6B6B] space-y-2">
            <Inbox className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-semibold">Chưa có dữ liệu khóa học nào</p>
            <p className="text-xs">Khi học viên mua khóa học, số liệu thu nhập sẽ tự động hiển thị tại đây.</p>
          </div>
        ) : courseViewMode === 'chart' ? (
          /* Horizontal Bar Ranking view */
          <div className="space-y-4 pt-2">
            {coursesData.slice(0, 5).map((course, index) => {
              const maxRevenue = Math.max(...coursesData.map((c) => c.netRevenue || 0), 1);
              const percent = Math.round(((course.netRevenue || 0) / maxRevenue) * 100);
              return (
                <div key={course.courseId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] shrink-0">
                        {index + 1}
                      </span>
                      <img
                        src={getImageUrl(course.thumbnailUrl, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150')}
                        alt={course.courseTitle}
                        className="w-8 h-6 object-cover rounded shrink-0 border border-[#E4E4E0]"
                      />
                      <span className="font-semibold text-slate-800 truncate">
                        {course.courseTitle}
                      </span>
                      <span className="text-slate-400 shrink-0">
                        {course.totalSold || 0} lượt bán
                      </span>
                    </div>
                    <span className="font-bold text-emerald-700 shrink-0">
                      {formatCurrency(course.netRevenue || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percent, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Full Table View */
          <div className="space-y-4">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E4E4E0] text-[#5E5E5E] uppercase tracking-wider font-semibold">
                    <th className="pb-3 pr-4">Khóa học</th>
                    <th className="pb-3 px-4 text-right">Giá bán</th>
                    <th className="pb-3 px-4 text-center">Lượt bán</th>
                    <th className="pb-3 pl-4 text-right">Thu nhập của bạn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E0] transition-opacity duration-200">
                  {paginatedCourses.map((course) => {
                    return (
                      <tr key={course.courseId} className="hover:bg-[#FAF9FC] transition-colors group">
                        {/* Khóa học */}
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getImageUrl(course.thumbnailUrl, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150')}
                              alt={course.courseTitle}
                              className="w-12 h-9 object-cover rounded-lg border border-[#E4E4E0] shrink-0"
                            />
                            <div className="min-w-0 max-w-sm">
                              <Link
                                to={`/courses/${course.courseSlug}`}
                                target="_blank"
                                className="font-bold text-[#001D37] hover:text-[#16324F] transition-colors line-clamp-1 flex items-center gap-1"
                              >
                                <span>{course.courseTitle}</span>
                                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </Link>
                              <span className="text-[10px] text-[#6B6B6B] font-mono">ID: #{course.courseId}</span>
                            </div>
                          </div>
                        </td>

                        {/* Giá bán */}
                        <td className="py-4 px-4 text-right font-medium text-[#1A1C1E]">
                          {formatCurrency(course.coursePrice)}
                        </td>

                        {/* Số lượt bán */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                            {course.totalSold || 0}
                          </span>
                        </td>

                        {/* Thu nhập của bạn */}
                        <td className="py-4 pl-4 text-right font-bold text-emerald-700 text-sm">
                          {formatCurrency(course.netRevenue || 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Thanh phân trang client-side mượt mà không tràn viền */}
            <Pagination
              currentPage={coursePage}
              totalItems={sortedCourses.length}
              pageSize={COURSE_PAGE_SIZE}
              onPageChange={(page) => setCoursePage(page)}
              className="rounded-xl border border-[#E4E4E0]"
            />
          </div>
        )}

      </div>

    </div>
  );
};

// Custom Tooltip component for Instructor Net Revenue Chart
function CustomInstructorTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload || {};

  return (
    <div className="bg-[#001D37] text-white p-3.5 rounded-xl shadow-xl border border-slate-700/80 text-xs min-w-[190px] space-y-2">
      <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 font-semibold text-slate-200">
        <span className="flex items-center gap-1.5">
          <Calendar size={13} className="text-amber-400" />
          Kỳ: {label}
        </span>
        <span className="text-[11px] font-normal text-slate-400">
          {data.ordersCount || 0} đơn
        </span>
      </div>
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-slate-300">Thu nhập thực nhận:</span>
          </div>
          <span className="font-bold text-emerald-400">
            {formatCurrency(data.netRevenue || 0)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
          <span>Số khóa học bán được:</span>
          <span className="font-semibold text-slate-200">{data.ordersCount || 0} khóa</span>
        </div>
      </div>
    </div>
  );
}
