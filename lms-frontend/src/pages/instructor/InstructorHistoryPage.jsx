import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  PlusCircle,
  Trash2,
  ShieldCheck,
  User,
  Filter,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTeachingCourses } from '../../hooks/useCourses';
import { useInstructorHistory, useRestoreCourseFromHistory } from '../../hooks/useInstructorHistory';
import { Pagination } from '../../components/common/Pagination';
import { formatTimeAgo } from '../../utils/format';

const PAGE_SIZE = 10;

const ACTION_OPTIONS = [
  { value: '', label: 'Tất cả hành động' },
  { value: 'COURSE_CREATED', label: 'Tạo khóa học' },
  { value: 'COURSE_UPDATED', label: 'Cập nhật khóa học' },
  { value: 'COURSE_SUBMITTED', label: 'Gửi duyệt khóa học' },
  { value: 'COURSE_APPROVED', label: 'Khóa học được duyệt' },
  { value: 'COURSE_REJECTED', label: 'Khóa học bị từ chối' },
  { value: 'COURSE_DELETE_REQUESTED', label: 'Yêu cầu xóa khóa học' },
  { value: 'COURSE_DELETED', label: 'Khóa học đã xóa' },
  { value: 'COURSE_RESTORED', label: 'Khôi phục khóa học' },
  { value: 'SECTION_CREATED', label: 'Thêm chương mới' },
  { value: 'SECTION_UPDATED', label: 'Cập nhật chương' },
  { value: 'SECTION_DELETED', label: 'Xóa chương' },
  { value: 'LESSON_CREATED', label: 'Thêm bài giảng' },
  { value: 'LESSON_UPDATED', label: 'Cập nhật bài giảng' },
  { value: 'LESSON_DELETED', label: 'Xóa bài giảng' },
];

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const InstructorHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, confirm } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Lấy danh sách khóa học của giảng viên để cho vào dropdown lọc
  const { data: courses = [] } = useTeachingCourses();

  // Query dữ liệu lịch sử phía server
  const { data, isLoading } = useInstructorHistory({
    page: currentPage - 1,
    size: PAGE_SIZE,
    action: selectedAction,
    courseId: selectedCourseId,
    from: fromDate,
    to: toDate,
    enabled: !!user,
  });

  const restoreCourseMutation = useRestoreCourseFromHistory();

  const logs = data?.content || [];
  const totalElements = data?.totalElements || 0;

  const hasActiveFilters = Boolean(selectedAction || selectedCourseId || fromDate || toDate);

  const handleResetFilters = () => {
    setSelectedAction('');
    setSelectedCourseId('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const handleRestore = (log) => {
    confirm({
      title: 'Khôi phục khóa học',
      message: `Bạn có chắc chắn muốn khôi phục khóa học "${log.entityLabel || 'này'}"? Khóa học sẽ được chuyển lại trạng thái Đã xuất bản (PUBLISHED) và tiếp tục mở bán.`,
      confirmText: 'Khôi phục ngay',
      isWarning: false,
      onConfirm: async () => {
        try {
          await restoreCourseMutation.mutateAsync(log.entityId);
          showToast(`Đã khôi phục khóa học "${log.entityLabel || ''}" thành công!`, 'success');
        } catch (err) {
          showToast(err.response?.data?.message || 'Lỗi khi khôi phục khóa học!', 'error');
        }
      },
    });
  };

  const getActionBadge = (action, actionLabel) => {
    const label = actionLabel || action;
    switch (action) {
      case 'COURSE_CREATED':
      case 'SECTION_CREATED':
      case 'LESSON_CREATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PlusCircle className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'COURSE_APPROVED':
      case 'COURSE_RESTORED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'COURSE_UPDATED':
      case 'SECTION_UPDATED':
      case 'LESSON_UPDATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Edit3 className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'COURSE_SUBMITTED':
      case 'COURSE_DELETE_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'COURSE_REJECTED':
      case 'COURSE_DELETED':
      case 'SECTION_DELETED':
      case 'LESSON_DELETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            {action === 'COURSE_REJECTED' ? (
              <XCircle className="w-3.5 h-3.5" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="py-10 px-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E0] pb-6">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#001D37] flex items-center gap-2.5">
            <History className="w-6 h-6 text-amber-500" />
            <span>Lịch sử khóa học</span>
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-1">
            Theo dõi chi tiết các lần thêm, sửa, xóa, gửi duyệt và quyết định phê duyệt các khóa học của bạn
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E4E4E0] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#001D37]">
          <Filter className="w-4 h-4 text-amber-500" />
          <span>Bộ lọc nhật ký</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Action Filter */}
          <div>
            <label htmlFor="action-filter" className="block text-[11px] font-medium text-[#5E5E5E] mb-1">
              Hành động
            </label>
            <select
              id="action-filter"
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-[#E4E4E0] rounded-lg px-3 py-2 bg-white text-[#1A1C1E] focus:outline-none focus:border-[#001D37]"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <label htmlFor="course-filter" className="block text-[11px] font-medium text-[#5E5E5E] mb-1">
              Khóa học
            </label>
            <select
              id="course-filter"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-[#E4E4E0] rounded-lg px-3 py-2 bg-white text-[#1A1C1E] focus:outline-none focus:border-[#001D37]"
            >
              <option value="">Tất cả khóa học</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label htmlFor="from-date-filter" className="block text-[11px] font-medium text-[#5E5E5E] mb-1">
              Từ ngày
            </label>
            <input
              id="from-date-filter"
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-[#E4E4E0] rounded-lg px-3 py-2 bg-white text-[#1A1C1E] focus:outline-none focus:border-[#001D37]"
            />
          </div>

          {/* To Date */}
          <div>
            <label htmlFor="to-date-filter" className="block text-[11px] font-medium text-[#5E5E5E] mb-1">
              Đến ngày
            </label>
            <input
              id="to-date-filter"
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-[#E4E4E0] rounded-lg px-3 py-2 bg-white text-[#1A1C1E] focus:outline-none focus:border-[#001D37]"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-xs text-[#5E5E5E] hover:text-[#001D37] hover:bg-[#FAF9FC] border border-[#E4E4E0] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc</span>
            </button>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white border border-[#E4E4E0] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-xs text-[#5E5E5E]">
            Đang tải dữ liệu lịch sử khóa học...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-24 text-center space-y-2">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-serif font-bold text-base text-[#1A1C1E]">
              {hasActiveFilters
                ? 'Không tìm thấy nhật ký phù hợp'
                : 'Chưa có lịch sử hoạt động'}
            </p>
            <p className="text-xs text-[#5E5E5E]">
              {hasActiveFilters
                ? 'Thử thay đổi điều kiện tìm kiếm hoặc đặt lại bộ lọc.'
                : 'Mọi hoạt động tạo, chỉnh sửa và xét duyệt khóa học sẽ được lưu tại đây.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 px-3 py-1.5 bg-[#001D37] text-white text-xs font-semibold rounded-lg hover:bg-[#002B4E] transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xem tất cả nhật ký</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9FC] border-b border-[#E4E4E0] text-[11px] font-bold text-[#5E5E5E] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Hành động</th>
                  <th className="py-3.5 px-4">Khóa học</th>
                  <th className="py-3.5 px-4">Chi tiết thay đổi / Lý do</th>
                  <th className="py-3.5 px-4">Người thực hiện</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E0] text-xs">
                {logs.map((log) => {
                  const isAdminActor = log.actorRole === 'ROLE_ADMIN' || log.actorRole === 'ADMIN';

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-[#F8F7FA] transition-colors"
                    >
                      {/* Thời gian */}
                      <td className="py-4 px-4 whitespace-nowrap align-top">
                        <div className="font-medium text-[#1A1C1E]">
                          {formatTimeAgo(log.createdAt)}
                        </div>
                        <div className="text-[11px] text-[#5E5E5E] mt-0.5">
                          {formatDateTime(log.createdAt)}
                        </div>
                      </td>

                      {/* Hành động */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        {getActionBadge(log.action, log.actionLabel)}
                      </td>

                      {/* Khóa học */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-semibold text-[#001D37] line-clamp-2">
                          {log.entityLabel || `Khóa học #${log.entityId}`}
                        </div>
                        {log.entityId && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/instructor/courses/editor?courseId=${log.entityId}`)
                            }
                            className="inline-flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-700 font-medium mt-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Mở trình soạn</span>
                          </button>
                        )}
                      </td>

                      {/* Chi tiết thay đổi / Lý do */}
                      <td className="py-4 px-4 align-top max-w-md">
                        {log.details ? (
                          <div className="text-[#1A1C1E] bg-[#FAF9FC] border border-[#E4E4E0]/60 rounded-lg p-2.5 text-xs whitespace-pre-line leading-relaxed">
                            {log.details}
                          </div>
                        ) : (
                          <span className="text-[#5E5E5E] italic">
                            Không có chi tiết bổ sung
                          </span>
                        )}
                      </td>

                      {/* Người thực hiện */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        {isAdminActor ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                            <span>Quản trị viên</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700">
                            <User className="w-3.5 h-3.5 text-gray-500" />
                            <span>{log.isCurrentActor ? 'Bạn' : log.actorName || 'Giảng viên'}</span>
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                        {log.canRestore && (
                          <button
                            type="button"
                            onClick={() => handleRestore(log)}
                            disabled={restoreCourseMutation.isPending}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Khôi phục</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-side Pagination */}
        {totalElements > 0 && (
          <div className="p-4 border-t border-[#E4E4E0]">
            <Pagination
              currentPage={currentPage}
              totalItems={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorHistoryPage;
