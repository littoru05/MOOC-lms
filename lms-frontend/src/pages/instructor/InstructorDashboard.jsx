import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeachingCourses, useSubmitForReview, useRequestDeleteCourse, useDeleteCourse, useRestoreCourse } from '../../hooks/useCourses';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Plus,
  Edit3,
  HelpCircle,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Users,
  Archive,
  RotateCcw,
  Filter,
} from 'lucide-react';

import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/imageUrl';
import { Pagination } from '../../components/common/Pagination';

export const InstructorDashboard = ({ onEditCourse, onCreateCourse, onBuildQuiz }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, confirm } = useToast();

  const { data: courses = [], isLoading: loading } = useTeachingCourses();
  const submitReviewMutation = useSubmitForReview();
  const requestDeleteMutation = useRequestDeleteCourse();
  const deleteCourseMutation = useDeleteCourse();
  const restoreCourseMutation = useRestoreCourse();

  // Client-side pagination state (5 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PUBLISHED' | 'PENDING' | 'ARCHIVED' | 'DRAFT'
  const PAGE_SIZE = 5;

  // Đếm số lượng theo trạng thái
  const publishedCount = courses.filter((c) => c.status === 'PUBLISHED').length;
  const pendingCount = courses.filter((c) => c.status === 'PENDING' || c.status === 'PENDING_DELETE').length;
  const archivedCount = courses.filter((c) => c.status === 'ARCHIVED').length;
  const draftCount = courses.filter((c) => c.status === 'DRAFT' || !c.status).length;

  // Lọc theo trạng thái và sắp xếp giảm dần theo ID mới nhất
  const filteredCourses = useMemo(() => {
    let list = [...courses];
    if (statusFilter === 'PUBLISHED') {
      list = list.filter((c) => c.status === 'PUBLISHED');
    } else if (statusFilter === 'PENDING') {
      list = list.filter((c) => c.status === 'PENDING' || c.status === 'PENDING_DELETE');
    } else if (statusFilter === 'ARCHIVED') {
      list = list.filter((c) => c.status === 'ARCHIVED');
    } else if (statusFilter === 'DRAFT') {
      list = list.filter((c) => c.status === 'DRAFT' || !c.status);
    }
    return list.sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [courses, statusFilter]);

  // Phân trang cục bộ
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredCourses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCourses, currentPage]);

  const handleStatusCardClick = (targetFilter) => {
    setStatusFilter((prev) => (prev === targetFilter ? 'ALL' : targetFilter));
    setCurrentPage(1);
  };

  const handleEdit = (cid) => {
    if (onEditCourse) onEditCourse(cid);
    else navigate(`/instructor/courses/editor?courseId=${cid}`);
  };

  const handleCreate = () => {
    if (onCreateCourse) onCreateCourse();
    else navigate('/instructor/courses/create');
  };

  const handleBuild = (cid) => {
    if (onBuildQuiz) onBuildQuiz(cid);
    else navigate(`/instructor/courses/quiz-builder?courseId=${cid}`);
  };

  const handleSubmitReview = (courseId) => {
    confirm({
      title: 'Gửi kiểm duyệt khóa học',
      message: 'Bạn có chắc chắn muốn gửi khóa học này lên Quản trị viên để xét duyệt xuất bản lên hệ thống?',
      confirmText: 'Gửi duyệt ngay',
      onConfirm: async () => {
        try {
          await submitReviewMutation.mutateAsync(courseId);
          showToast('Đã gửi yêu cầu kiểm duyệt khóa học thành công lên Quản trị viên!', 'success');
        } catch (err) {
          showToast(err.response?.data?.message || 'Lỗi khi gửi yêu cầu kiểm duyệt!', 'error');
        }
      },
    });
  };

  const handleDeleteCourse = (course) => {
    const enrolledCount = course.enrolledCount || course.studentsCount || 0;

    if (enrolledCount > 0) {
      confirm({
        title: 'Lưu trữ khóa học (Ngừng kinh doanh)',
        message: `Khóa học "${course.title}" đã có ${enrolledCount} học viên đăng ký. Bạn không thể xóa hoàn toàn nhằm đảm bảo quyền lợi cho học viên tiếp tục học tập. Khóa học sẽ được chuyển sang trạng thái Lưu trữ (Ngừng kinh doanh), ngừng nhận học viên mới và ẩn khỏi trang tìm kiếm công khai. Bạn có chắc chắn muốn lưu trữ khóa học này?`,
        confirmText: 'Lưu trữ khóa học',
        isWarning: true,
        onConfirm: async () => {
          try {
            const res = await deleteCourseMutation.mutateAsync(course.id);
            showToast(res.data?.message || 'Đã chuyển khóa học sang trạng thái Lưu trữ (Ngừng kinh doanh)!', 'warning');
          } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi khi lưu trữ khóa học!', 'error');
          }
        },
      });
    } else {
      confirm({
        title: 'Xác nhận xóa vĩnh viễn khóa học',
        message: `Khóa học "${course.title}" chưa có học viên nào đăng ký. Khóa học sẽ được xóa hoàn toàn khỏi danh sách và hệ thống. Thao tác này không thể hoàn tác. Bạn có chắc chắn muốn xóa?`,
        confirmText: 'Xóa vĩnh viễn',
        isDanger: true,
        onConfirm: async () => {
          try {
            const res = await deleteCourseMutation.mutateAsync(course.id);
            showToast(res.data?.message || 'Đã xóa khóa học thành công khỏi hệ thống!', 'success');
          } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi khi xóa khóa học!', 'error');
          }
        },
      });
    }
  };

  const handleRestoreCourse = (course) => {
    confirm({
      title: 'Khôi phục khóa học',
      message: `Bạn có chắc chắn muốn khôi phục khóa học "${course.title}"? Khóa học sẽ được chuyển lại trạng thái Đã xuất bản (PUBLISHED) và tiếp tục mở bán cho học viên mới.`,
      confirmText: 'Khôi phục khóa học',
      isWarning: false,
      onConfirm: async () => {
        try {
          await restoreCourseMutation.mutateAsync(course.id);
          showToast(`Đã khôi phục khóa học "${course.title}" thành công! Khóa học đã mở bán trở lại.`, 'success');
        } catch (err) {
          showToast(err.response?.data?.message || 'Lỗi khi khôi phục khóa học!', 'error');
        }
      },
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="px-2.5 py-0.5 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#15803D] text-[11px] font-bold rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Đã xuất bản
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-bold rounded-full flex items-center gap-1">
            <Archive className="w-3 h-3" /> Đã lưu trữ
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> Chờ Admin duyệt
          </span>
        );
      case 'PENDING_DELETE':
        return (
          <span className="px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold rounded-full flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Chờ duyệt xóa
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 bg-[#BA1A1A]/10 border border-[#BA1A1A]/30 text-[#BA1A1A] text-[11px] font-bold rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Bị từ chối
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 bg-[#EFEDF0] border border-[#E4E4E0] text-[#5E5E5E] text-[11px] font-bold rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Bản nháp (Draft)
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] py-8 px-8 space-y-8">
      {/* Top Clean Header */}
      <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F4F3F6] border border-[#E4E4E0] rounded-md text-[11px] font-bold text-[#16324F]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Không gian Giảng viên Chuyên môn</span>
          </div>
          <h1 className="text-2xl font-bold text-[#001D37] tracking-tight">
            Bảng điều khiển Giảng dạy & Khóa học
          </h1>
          <p className="text-xs text-[#5E5E5E]">
            Quản lý danh sách khóa học, biên soạn giáo trình, câu hỏi khảo thí trắc nghiệm và gửi phê duyệt lên Quản trị viên.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl self-start md:self-auto transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo khóa học mới</span>
        </button>
      </div>

      {/* 5 Stats Cards (Clickable Filter) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {/* Card 1: Tổng khóa học */}
        <button
          type="button"
          onClick={() => handleStatusCardClick('ALL')}
          className={`border rounded-2xl p-5 shadow-xs space-y-1 transition-all cursor-pointer text-left select-none relative group hover:shadow-md active:scale-98 ${
            statusFilter === 'ALL'
              ? 'bg-[#001D37]/5 border-[#001D37] ring-2 ring-[#001D37]'
              : 'bg-white border-[#E4E4E0] hover:border-[#001D37]/40'
          }`}
          title="Bấm để xem tất cả khóa học"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#5E5E5E] uppercase font-bold tracking-wider">Tổng khóa học</span>
            {statusFilter === 'ALL' && (
              <span className="text-[10px] font-bold text-[#001D37] bg-white px-2 py-0.5 rounded-full border border-[#001D37]/20">
                Đang xem
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-[#001D37] ">{courses.length}</p>
        </button>

        {/* Card 2: Đã xuất bản */}
        <button
          type="button"
          onClick={() => handleStatusCardClick('PUBLISHED')}
          className={`border rounded-2xl p-5 shadow-xs space-y-1 transition-all cursor-pointer text-left select-none relative group hover:shadow-md active:scale-98 ${
            statusFilter === 'PUBLISHED'
              ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500'
              : 'bg-white border-[#E4E4E0] hover:border-emerald-500/40'
          }`}
          title="Bấm để lọc các khóa học đã xuất bản"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-600 uppercase font-bold tracking-wider">Đã xuất bản</span>
            {statusFilter === 'PUBLISHED' && (
              <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                Đang xem
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-emerald-600 ">{publishedCount}</p>
        </button>

        {/* Card 3: Chờ xét duyệt */}
        <button
          type="button"
          onClick={() => handleStatusCardClick('PENDING')}
          className={`border rounded-2xl p-5 shadow-xs space-y-1 transition-all cursor-pointer text-left select-none relative group hover:shadow-md active:scale-98 ${
            statusFilter === 'PENDING'
              ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500'
              : 'bg-white border-[#E4E4E0] hover:border-amber-500/40'
          }`}
          title="Bấm để lọc các khóa học chờ xét duyệt"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-600 uppercase font-bold tracking-wider">Chờ xét duyệt</span>
            {statusFilter === 'PENDING' && (
              <span className="text-[10px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                Đang xem
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-amber-600 ">{pendingCount}</p>
        </button>

        {/* Card 4: Đã lưu trữ */}
        <button
          type="button"
          onClick={() => handleStatusCardClick('ARCHIVED')}
          className={`border rounded-2xl p-5 shadow-xs space-y-1 transition-all cursor-pointer text-left select-none relative group hover:shadow-md active:scale-98 ${
            statusFilter === 'ARCHIVED'
              ? 'bg-slate-100 border-slate-500 ring-2 ring-slate-500'
              : 'bg-white border-[#E4E4E0] hover:border-slate-400'
          }`}
          title="Bấm để lọc các khóa học đã lưu trữ"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-600 uppercase font-bold tracking-wider">Đã lưu trữ</span>
            {statusFilter === 'ARCHIVED' && (
              <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-300">
                Đang xem
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-700 ">{archivedCount}</p>
        </button>

        {/* Card 5: Bản nháp */}
        <button
          type="button"
          onClick={() => handleStatusCardClick('DRAFT')}
          className={`border rounded-2xl p-5 shadow-xs space-y-1 transition-all cursor-pointer text-left select-none relative group hover:shadow-md active:scale-98 ${
            statusFilter === 'DRAFT'
              ? 'bg-gray-100 border-gray-600 ring-2 ring-gray-600'
              : 'bg-white border-[#E4E4E0] hover:border-gray-400'
          }`}
          title="Bấm để lọc các khóa học bản nháp"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#5E5E5E] uppercase font-bold tracking-wider">Bản nháp</span>
            {statusFilter === 'DRAFT' && (
              <span className="text-[10px] font-bold text-gray-700 bg-white px-2 py-0.5 rounded-full border border-gray-300">
                Đang xem
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-[#5E5E5E] ">{draftCount}</p>
        </button>
      </div>

      {/* Courses Table / List */}
      <div className="bg-white border border-[#E4E4E0] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E4E4E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9FC]">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className=" font-bold text-[#001D37] text-base">
              Danh sách khóa học của bạn ({filteredCourses.length})
            </h3>
            {statusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-[#E4E4E0] text-[#16324F] shadow-2xs">
                <span>
                  Đang lọc:{' '}
                  {statusFilter === 'PUBLISHED'
                    ? 'Đã xuất bản'
                    : statusFilter === 'PENDING'
                    ? 'Chờ xét duyệt'
                    : statusFilter === 'ARCHIVED'
                    ? 'Đã lưu trữ'
                    : 'Bản nháp'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('ALL');
                    setCurrentPage(1);
                  }}
                  className="text-[#5E5E5E] hover:text-red-600 cursor-pointer font-bold ml-1 text-sm leading-none"
                  title="Bỏ lọc, xem tất cả"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <span className="text-xs text-[#5E5E5E]">Quản lý nội dung và gửi duyệt</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xs text-[#5E5E5E]">Đang tải danh sách khóa học...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <BookOpen className="w-10 h-10 text-[#5E5E5E] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-[#1A1C1E]">Bạn chưa có khóa học nào</p>
            <button
              onClick={handleCreate}
              className="mt-3 px-5 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Bắt đầu tạo khóa học đầu tiên
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Filter className="w-10 h-10 text-[#5E5E5E] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-[#1A1C1E]">
              Không có khóa học nào thuộc trạng thái này
            </p>
            <p className="text-xs text-[#5E5E5E]">
              Thử chọn ô chỉ số khác hoặc quay lại xem tất cả khóa học của bạn.
            </p>
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className="mt-3 px-4 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Xem tất cả ({courses.length}) khóa học
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E4E0] transition-opacity duration-200">
            {paginatedCourses.map((c) => (
              <div key={c.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#FAF9FC] transition-colors">
                {/* Left info */}
                <div className="flex items-start gap-4">
                  <img
                    src={getImageUrl(c.thumbnailUrl, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600')}
                    alt={c.title}
                    className="w-28 h-18 rounded-xl object-cover border border-[#E4E4E0] shrink-0 shadow-2xs"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(c.status)}
                      {(c.categoryName || c.category?.name) && (
                        <span className="text-[11px] font-semibold text-[#16324F] bg-[#F4F3F6] px-2.5 py-0.5 rounded-md border border-[#E4E4E0]">
                          {c.categoryName || c.category?.name}
                        </span>
                      )}
                      {(c.enrolledCount > 0 || c.studentsCount > 0) && (
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-500" /> {c.enrolledCount || c.studentsCount} học viên
                        </span>
                      )}
                    </div>
                    <h4 className=" font-bold text-base text-[#001D37] line-clamp-1">{c.title}</h4>
                    <p className="text-xs text-[#5E5E5E] line-clamp-1">{c.description}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
                  <button
                    onClick={() => handleEdit(c.id)}
                    className="px-3.5 py-2 bg-white border border-[#E4E4E0] hover:border-[#16324F] hover:bg-[#F4F3F6] text-[#1A1C1E] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    title="Chỉnh sửa nội dung & bài học"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#16324F]" /> Soạn bài học
                  </button>

                  <button
                    onClick={() => handleBuild(c.id)}
                    className="px-3.5 py-2 bg-white border border-[#E4E4E0] hover:border-amber-500 hover:bg-amber-50/50 text-[#1A1C1E] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    title="Soạn câu hỏi trắc nghiệm Quiz"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Soạn đề Quiz
                  </button>

                  {/* Nút gửi duyệt: hiển thị khi DRAFT hoặc REJECTED */}
                  {(c.status === 'DRAFT' || c.status === 'REJECTED' || !c.status) && (
                    <button
                      onClick={() => handleSubmitReview(c.id)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                      title="Gửi khóa học để Admin phê duyệt xuất bản"
                    >
                      <Send className="w-3.5 h-3.5" /> Gửi duyệt
                    </button>
                  )}

                  {/* Nút Xóa / Lưu trữ / Khôi phục */}
                  {c.status === 'ARCHIVED' ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5">
                        <Archive className="w-3.5 h-3.5 text-slate-500" /> Đã lưu trữ
                      </span>
                      <button
                        onClick={() => handleRestoreCourse(c)}
                        className="px-3.5 py-2 bg-white border border-emerald-300 hover:border-emerald-600 hover:bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                        title="Khôi phục khóa học về trạng thái Đã xuất bản (mở bán lại)"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-600" /> Khôi phục
                      </button>
                    </div>
                  ) : c.status === 'PENDING_DELETE' ? (
                    <span className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Đang chờ duyệt xóa
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDeleteCourse(c)}
                      className="px-3 py-2 bg-white border border-[#E4E4E0] hover:border-red-400 hover:bg-red-50 text-[#BA1A1A] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                      title={c.enrolledCount > 0 ? 'Lưu trữ khóa học (Ngừng kinh doanh)' : 'Xóa vĩnh viễn khóa học'}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Thanh phân trang client-side */}
            {filteredCourses.length > PAGE_SIZE && (
              <div className="p-4 border-t border-[#E4E4E0] flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredCourses.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quizzes Management List */}
      <div className="bg-white border border-[#E4E4E0] rounded-xl overflow-hidden shadow-xs space-y-0">
        <div className="px-6 py-4 border-b border-[#E4E4E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div>
            <h3 className=" font-bold text-[#001D37] text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#16324F]" />
              <span>Danh sách Đề thi Trắc nghiệm Quiz đã biên soạn</span>
            </h3>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              Các đề thi này được đồng bộ thời gian thực sang khóa học tương ứng của Học viên
            </p>
          </div>

          <button
            onClick={() => handleBuild(courses[0]?.id || 1)}
            className="px-3.5 py-1.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Soạn đề Quiz mới
          </button>
        </div>

        <div className="p-8 text-center text-xs text-[#5E5E5E]">
          <HelpCircle className="w-8 h-8 text-[#A0A0A0] mx-auto mb-2 opacity-60" />
          <p className="font-medium text-[#1A1C1E]">Chưa có đề thi trắc nghiệm riêng lẻ</p>
          <p className="text-[11px] text-[#5E5E5E] mt-0.5">
            Bấm &quot;Soạn đề Quiz mới&quot; hoặc vào chi tiết từng khóa học để thiết lập đề thi trắc nghiệm.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
