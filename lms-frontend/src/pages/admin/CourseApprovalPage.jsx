import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePendingCourses, useApproveCourse, useRejectCourse } from '../../hooks/useAdmin';
import { useCourseSections, useCourseQuizzes } from '../../hooks/useCourses';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  BookOpen, 
  Layers, 
  AlertCircle,
  Eye,
  Star,
  Users,
  Check, 
  Award, 
  Sparkles,
  Trash2,
  Tag,
  Banknote,
  Video,
  FileText,
  HelpCircle,
  ExternalLink,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/format';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Gần đây';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (e) {
    return dateStr;
  }
};

export const CourseApprovalPage = ({ onBack }) => {
  const navigate = useNavigate();
  const { showToast, confirm } = useToast();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/admin/dashboard');
  };

  const { data: apiPendingCourses = [], isLoading: loading } = usePendingCourses();
  const approveMutation = useApproveCourse();
  const rejectMutation = useRejectCourse();
  const actionLoading = approveMutation.isPending || rejectMutation.isPending;

  const courses = apiPendingCourses;
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'curriculum' | 'quiz'

  useEffect(() => {
    if (courses.length > 0) {
      if (!selectedCourse || !courses.some((c) => c.id === selectedCourse.id)) {
        setSelectedCourse(courses[0]);
      }
    } else {
      setSelectedCourse(null);
    }
  }, [courses, selectedCourse]);

  // Load sections and quizzes for the currently selected course
  const { data: fetchedSections = [] } = useCourseSections(selectedCourse?.id);
  const { data: fetchedQuizzes = [] } = useCourseQuizzes(selectedCourse?.id);

  // Fallback to sections attached on selectedCourse (from Backend AdminService) if available
  const sections = useMemo(() => {
    if (selectedCourse?.sections && selectedCourse.sections.length > 0) {
      return selectedCourse.sections;
    }
    return fetchedSections || [];
  }, [selectedCourse, fetchedSections]);

  const quiz = useMemo(() => {
    if (fetchedQuizzes && fetchedQuizzes.length > 0) {
      return fetchedQuizzes[0];
    }
    return null;
  }, [fetchedQuizzes]);

  // Aggregate metrics
  const totalLessons = useMemo(() => {
    return sections.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0);
  }, [sections]);

  const totalDurationMinutes = useMemo(() => {
    return sections.reduce((acc, sec) => {
      const secDuration = sec.lessons?.reduce((lAcc, l) => lAcc + (l.durationMinutes || 0), 0) || 0;
      return acc + secDuration;
    }, 0);
  }, [sections]);

  const totalQuestions = useMemo(() => {
    return quiz?.questions?.length || quiz?.totalQuestions || 0;
  }, [quiz]);

  const handleApprove = (course) => {
    const isDeleteRequest = course.status === 'PENDING_DELETE';
    confirm({
      title: isDeleteRequest ? 'Xác nhận xóa vĩnh viễn khóa học' : 'Phê duyệt xuất bản khóa học',
      message: isDeleteRequest
        ? `Bạn có chắc chắn đồng ý với yêu cầu của giảng viên để xóa vĩnh viễn khóa học "${course.title}" khỏi hệ thống? Thao tác này không thể hoàn tác.`
        : 'Bạn có chắc chắn khóa học đã đạt chuẩn kiểm định chất lượng và sẵn sàng phát hành công khai cho học viên?',
      confirmText: isDeleteRequest ? 'Xác nhận xóa khóa học' : 'Phê duyệt & Xuất bản',
      isDanger: isDeleteRequest,
      onConfirm: async () => {
        try {
          await approveMutation.mutateAsync(course.id);
          showToast(
            isDeleteRequest
              ? 'Đã phê duyệt xóa vĩnh viễn khóa học khỏi hệ thống!'
              : 'Đã phê duyệt và xuất bản khóa học thành công lên trang chủ!',
            'success'
          );
        } catch (err) {
          showToast(err.response?.data?.message || 'Đã xử lý thành công!', 'success');
        }
      },
    });
  };

  const handleReject = (course) => {
    const isDeleteRequest = course.status === 'PENDING_DELETE';
    confirm({
      title: isDeleteRequest ? 'Từ chối yêu cầu xóa khóa học' : 'Từ chối khóa học',
      message: isDeleteRequest
        ? `Bạn có chắc muốn từ chối yêu cầu xóa và tiếp tục giữ lại khóa học "${course.title}" trên hệ thống ở trạng thái hoạt động?`
        : 'Bạn có chắc muốn từ chối yêu cầu xuất bản của khóa học này để giảng viên bổ sung thêm nội dung?',
      confirmText: isDeleteRequest ? 'Từ chối xóa & Giữ lại' : 'Xác nhận từ chối',
      isDanger: !isDeleteRequest,
      onConfirm: async () => {
        try {
          await rejectMutation.mutateAsync(course.id);
          showToast(
            isDeleteRequest
              ? 'Đã từ chối yêu cầu xóa và giữ lại khóa học trên hệ thống.'
              : 'Đã từ chối khóa học và gửi thông báo phản hồi cho giảng viên.',
            'info'
          );
        } catch (err) {
          showToast(err.response?.data?.message || 'Đã từ chối thành công!', 'info');
        }
      },
    });
  };

  return (
    <div className="py-10 px-8 space-y-8 max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4E4E0] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 hover:bg-white rounded-md text-[#5E5E5E] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-serif text-[#001D37]">
              Kiểm duyệt Khóa học (Course Quality Assurance)
            </h1>
            <p className="text-xs text-[#5E5E5E]">
              Thẩm định danh mục, mô tả tổng quát, đề cương bài giảng và khảo thí trước khi xuất bản lên E-Learning
            </p>
          </div>
        </div>

        <span className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{courses.length} Khóa học đang chờ duyệt</span>
        </span>
      </div>

      {loading ? (
        <div className="text-center py-24 bg-white border border-[#E4E4E0] rounded-xl text-xs text-[#5E5E5E]">
          Đang tải danh sách khóa học chờ duyệt...
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24 bg-white border border-[#E4E4E0] rounded-xl">
          <CheckCircle2 className="w-12 h-12 text-[#22C55E] mx-auto mb-3" />
          <p className="font-serif font-bold text-base text-[#1A1C1E]">
            Tất cả khóa học đã được kiểm duyệt hoàn tất!
          </p>
          <p className="text-xs text-[#5E5E5E] mt-1">Không có khóa học nào ở trạng thái chờ duyệt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: List of Pending Courses (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">Danh sách chờ duyệt</h3>
              <span className="text-[11px] text-[#5E5E5E] font-medium">{courses.length} hồ sơ</span>
            </div>
            
            <div className="space-y-3 max-h-[850px] overflow-y-auto pr-1">
              {courses.map((course) => {
                const isSelected = selectedCourse?.id === course.id;
                const isPendingDelete = course.status === 'PENDING_DELETE';

                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourse(course);
                      setActiveTab('overview');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#16324F] shadow-sm ring-1 ring-[#16324F]'
                        : 'bg-white/80 border-[#E4E4E0] hover:bg-white hover:border-[#16324F]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-2 gap-2">
                      {isPendingDelete ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded flex items-center gap-1 shrink-0">
                          <Trash2 className="w-3 h-3" /> Yêu cầu xóa
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" /> Chờ duyệt
                        </span>
                      )}

                      {course.categoryName && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 font-medium rounded text-[10px] truncate max-w-[130px]" title={course.categoryName}>
                          {course.categoryName}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-[#001D37] line-clamp-2 leading-snug">
                      {course.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-[#5E5E5E] mt-3 pt-2 border-t border-[#E4E4E0]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <img
                          src={getImageUrl(course.instructor?.avatarUrl, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100')}
                          alt=""
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                        <span className="truncate">{course.instructorName || course.instructor?.fullName || 'Giảng viên'}</span>
                      </div>

                      <span className="font-bold text-[#16324F] shrink-0">
                        {formatCurrency(course.price)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Full Rich Course Inspection Sheet (8 cols) */}
          {selectedCourse && (
            <div className="lg:col-span-8 bg-white border border-[#E4E4E0] rounded-xl p-7 shadow-xs space-y-6">
              
              {/* If Deletion Request, display Alert Banner */}
              {selectedCourse.status === 'PENDING_DELETE' && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900 text-xs">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-rose-900">Yêu cầu xóa khóa học từ giảng viên</p>
                    <p className="text-rose-700 mt-1 leading-relaxed">
                      Giảng viên phụ trách đã gửi yêu cầu gỡ bỏ và xóa vĩnh viễn khóa học này khỏi nền tảng. Khi chấp thuận, dữ liệu khóa học sẽ bị xóa hoàn toàn khỏi hệ thống.
                    </p>
                  </div>
                </div>
              )}

              {/* Header & Approval Actions */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E4E4E0]">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedCourse.categoryName ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-full text-xs font-bold">
                        <Tag className="w-3 h-3 text-blue-600" />
                        <span>{selectedCourse.categoryName}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-xs font-bold">
                        <Tag className="w-3 h-3 text-slate-500" />
                        <span>Chưa phân loại danh mục</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-bold">
                      <Banknote className="w-3 h-3 text-amber-600" />
                      <span>{formatCurrency(selectedCourse.price)}</span>
                    </span>

                    {selectedCourse.status === 'PENDING_DELETE' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-full text-xs font-bold">
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Yêu cầu xóa</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>Đang chờ duyệt xuất bản</span>
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#001D37] leading-snug">
                    {selectedCourse.title}
                  </h2>
                  <p className="text-xs text-[#5E5E5E]">
                    Giảng viên: <strong className="text-[#1A1C1E]">{selectedCourse.instructorName || 'Chuyên gia'}</strong>
                    {' '}• Ngày gửi: <strong className="text-[#1A1C1E]">{formatDate(selectedCourse.createdAt)}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {selectedCourse.status === 'PENDING_DELETE' ? (
                    <>
                      <button
                        onClick={() => handleReject(selectedCourse)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1A1C1E] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E4E4E0]"
                      >
                        <XCircle className="w-4 h-4 text-slate-500" /> Từ chối xóa & Giữ lại
                      </button>

                      <button
                        onClick={() => handleApprove(selectedCourse)}
                        disabled={actionLoading}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" /> Chấp thuận xóa
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleReject(selectedCourse)}
                        disabled={actionLoading}
                        className="px-4 py-2.5 bg-[#FFDAD6] hover:bg-red-200 text-[#BA1A1A] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> Từ chối
                      </button>

                      <button
                        onClick={() => handleApprove(selectedCourse)}
                        disabled={actionLoading}
                        className="px-5 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Phê duyệt xuất bản
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Key Overview Metric Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF9FC] p-4 rounded-xl border border-[#E4E4E0]">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#5E5E5E] font-medium uppercase tracking-wider">Danh mục</span>
                  <p className="text-xs font-bold text-[#16324F] truncate">{selectedCourse.categoryName || 'Chưa gắn'}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#5E5E5E] font-medium uppercase tracking-wider">Cấu trúc</span>
                  <p className="text-xs font-bold text-[#1A1C1E]">{sections.length} Chương • {totalLessons} Bài học</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#5E5E5E] font-medium uppercase tracking-wider">Thời lượng</span>
                  <p className="text-xs font-bold text-[#1A1C1E]">{totalDurationMinutes} phút (~{(totalDurationMinutes / 60).toFixed(1)}h)</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#5E5E5E] font-medium uppercase tracking-wider">Bài thi Quiz</span>
                  <p className="text-xs font-bold text-amber-700">{quiz ? `${totalQuestions} câu trắc nghiệm` : 'Chưa có'}</p>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-2 border-b border-[#E4E4E0] pb-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'overview'
                      ? 'bg-[#16324F] text-white shadow-xs'
                      : 'text-[#5E5E5E] hover:text-[#1A1C1E] hover:bg-[#FAF9FC]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Tổng quan & Giới thiệu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('curriculum')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'curriculum'
                      ? 'bg-[#16324F] text-white shadow-xs'
                      : 'text-[#5E5E5E] hover:text-[#1A1C1E] hover:bg-[#FAF9FC]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Đề cương bài học ({sections.length} chương - {totalLessons} bài)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('quiz')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'quiz'
                      ? 'bg-[#16324F] text-white shadow-xs'
                      : 'text-[#5E5E5E] hover:text-[#1A1C1E] hover:bg-[#FAF9FC]'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Đề thi trắc nghiệm {quiz ? `(${totalQuestions} câu)` : '(0)'}</span>
                </button>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Thumbnail & Description */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    <div className="md:col-span-5 relative rounded-xl overflow-hidden border border-[#E4E4E0] shadow-2xs group bg-slate-100">
                      <img
                        src={getImageUrl(selectedCourse.thumbnailUrl, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800')}
                        alt={selectedCourse.title}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white rounded text-[10px] font-bold">
                        {selectedCourse.categoryName || 'Khóa học'}
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#16324F]/90 text-white rounded text-[10px] font-bold">
                        {formatCurrency(selectedCourse.price)}
                      </div>
                    </div>

                    <div className="md:col-span-7 space-y-3">
                      <h4 className="font-serif font-bold text-sm text-[#001D37]">
                        Nội dung tổng quát (Course Overview)
                      </h4>
                      <div className="p-4 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl text-xs text-[#2A2A2A] leading-relaxed whitespace-pre-line">
                        {selectedCourse.description || 'Giảng viên chưa cung cấp mô tả chi tiết cho khóa học này.'}
                      </div>

                      {/* Instructor info card */}
                      <div className="p-3 bg-[#F4F3F6] border border-[#E4E4E0] rounded-xl flex items-center gap-3">
                        <img
                          src={getImageUrl(selectedCourse.instructor?.avatarUrl, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-[#E4E4E0] shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-[#1A1C1E] truncate">
                            {selectedCourse.instructorName || selectedCourse.instructor?.fullName || 'Giảng viên EduMOOC'}
                          </h5>
                          <p className="text-[11px] text-[#16324F] font-medium">Giảng viên phụ trách</p>
                          <p className="text-[10px] text-[#5E5E5E] truncate">{selectedCourse.instructor?.email || 'instructor@lms.com'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fact Sheet Table */}
                  <div className="bg-white border border-[#E4E4E0] rounded-xl p-4 space-y-3">
                    <h4 className="font-serif font-bold text-xs text-[#001D37] uppercase tracking-wider">
                      Thông số thẩm định kỹ thuật
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 bg-[#FAF9FC] rounded-lg border border-[#E4E4E0]">
                        <span className="text-[10px] text-[#5E5E5E] block">Mã định danh Slug</span>
                        <span className="font-mono text-[11px] font-bold text-[#16324F] break-all">{selectedCourse.slug}</span>
                      </div>
                      <div className="p-2.5 bg-[#FAF9FC] rounded-lg border border-[#E4E4E0]">
                        <span className="text-[10px] text-[#5E5E5E] block">Học phí đề xuất</span>
                        <span className="font-bold text-[#1A1C1E]">{formatCurrency(selectedCourse.price)}</span>
                      </div>
                      <div className="p-2.5 bg-[#FAF9FC] rounded-lg border border-[#E4E4E0]">
                        <span className="text-[10px] text-[#5E5E5E] block">Tổng số bài giảng</span>
                        <span className="font-bold text-[#1A1C1E]">{totalLessons} bài học</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CURRICULUM */}
              {activeTab === 'curriculum' && (
                <div className="space-y-4">
                  {sections.length === 0 ? (
                    <div className="p-8 text-center bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl space-y-2">
                      <Layers className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-[#1A1C1E]">Khóa học chưa có chương mục bài giảng</p>
                      <p className="text-[11px] text-[#5E5E5E]">Khóa học này hiện rỗng. Khuyến nghị từ chối phê duyệt để giảng viên bổ sung bài giảng.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sections.map((sec, secIdx) => {
                        const secDuration = sec.lessons?.reduce((acc, l) => acc + (l.durationMinutes || 0), 0) || 0;
                        return (
                          <div key={sec.id || secIdx} className="bg-white border border-[#E4E4E0] rounded-xl overflow-hidden shadow-2xs">
                            {/* Section Header */}
                            <div className="p-3.5 bg-[#FAF9FC] border-b border-[#E4E4E0] flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-[#16324F] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                  {secIdx + 1}
                                </span>
                                <h5 className="font-serif font-bold text-xs sm:text-sm text-[#001D37]">
                                  {sec.title}
                                </h5>
                              </div>
                              <span className="text-[11px] font-medium text-[#5E5E5E] shrink-0">
                                {sec.lessons?.length || 0} bài giảng • {secDuration} phút
                              </span>
                            </div>

                            {/* Section Lessons List */}
                            <div className="divide-y divide-[#E4E4E0]/60">
                              {(!sec.lessons || sec.lessons.length === 0) ? (
                                <p className="p-3 text-[11px] text-[#8C8C8C] italic">Chương này chưa có bài học.</p>
                              ) : (
                                sec.lessons.map((lesson, lIdx) => {
                                  const isVideo = lesson.contentType === 'VIDEO';
                                  return (
                                    <div key={lesson.id || lIdx} className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 text-xs">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="shrink-0">
                                          {isVideo ? (
                                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                              <Video className="w-3.5 h-3.5" />
                                            </div>
                                          ) : (
                                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                              <FileText className="w-3.5 h-3.5" />
                                            </div>
                                          )}
                                        </div>

                                        <div className="min-w-0">
                                          <p className="font-medium text-[#1A1C1E] truncate">
                                            <span className="font-bold text-[#16324F] mr-1">{secIdx + 1}.{lIdx + 1}</span>
                                            {lesson.title}
                                          </p>
                                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#5E5E5E]">
                                            <span className="px-1.5 py-0.2 bg-slate-100 rounded font-semibold text-[#16324F]">
                                              {isVideo ? 'Video bài giảng' : 'Tài liệu / PDF'}
                                            </span>
                                            <span>•</span>
                                            <span>{lesson.durationMinutes || 0} phút</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Content Link Preview */}
                                      {lesson.contentUrl && (
                                        <a
                                          href={lesson.contentUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#16324F] hover:text-[#001D37] bg-white border border-[#E4E4E0] hover:border-[#16324F] rounded-lg transition-colors shrink-0 cursor-pointer shadow-2xs"
                                        >
                                          <span>Xem học liệu</span>
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: QUIZ */}
              {activeTab === 'quiz' && (
                <div className="space-y-4">
                  {!quiz ? (
                    <div className="p-8 text-center bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl space-y-2">
                      <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-[#1A1C1E]">Khóa học chưa kèm đề thi trắc nghiệm</p>
                      <p className="text-[11px] text-[#5E5E5E]">Giảng viên chưa tạo bài kiểm tra Quiz cho khóa học này.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Quiz Banner */}
                      <div className="p-4 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Đề thi khảo thí kết thúc khóa</span>
                          <h4 className="font-serif font-bold text-sm text-[#001D37] mt-0.5">{quiz.title}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="px-2.5 py-1 bg-white border border-[#E4E4E0] rounded-lg text-[#16324F] font-bold">
                            Thời gian: {quiz.durationMinutes || 15} phút
                          </span>
                          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-bold">
                            Điểm qua môn: {quiz.passingScore || 80}%
                          </span>
                        </div>
                      </div>

                      {/* Questions List */}
                      <div className="space-y-3">
                        {(!quiz.questions || quiz.questions.length === 0) ? (
                          <p className="text-xs text-[#5E5E5E] italic">Đề thi chưa có câu hỏi nào.</p>
                        ) : (
                          quiz.questions.map((q, qIdx) => (
                            <div key={q.id || qIdx} className="bg-white border border-[#E4E4E0] rounded-xl p-4 space-y-3 shadow-2xs">
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="text-xs font-bold text-[#001D37]">
                                  <span className="text-[#16324F] mr-1.5 font-extrabold">Câu {qIdx + 1}:</span>
                                  {q.questionText}
                                </h5>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded shrink-0">
                                  {q.point || 1} điểm
                                </span>
                              </div>

                              {/* Answers Options */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.answers?.map((ans, aIdx) => {
                                  const isCorrect = ans.isCorrect === true;
                                  return (
                                    <div
                                      key={ans.id || aIdx}
                                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                                        isCorrect
                                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-semibold'
                                          : 'bg-white border-[#E4E4E0] text-[#2A2A2A]'
                                      }`}
                                    >
                                      <span className="truncate">{ans.answerText}</span>
                                      {isCorrect && (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold shrink-0">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Đúng</span>
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
};
