import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const targetCourseId = searchParams.get('courseId');
  const checkedParamRef = useRef(false);

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
    if (loading) return;

    if (courses.length > 0) {
      if (targetCourseId) {
        const found = courses.find((c) => String(c.id) === String(targetCourseId));
        if (found) {
          setSelectedCourse(found);
          return;
        } else if (!checkedParamRef.current) {
          checkedParamRef.current = true;
          showToast('Khóa học này đã được xử lý', 'info');
        }
      }

      if (!selectedCourse || !courses.some((c) => c.id === selectedCourse.id)) {
        setSelectedCourse(courses[0]);
      }
    } else {
      if (targetCourseId && !checkedParamRef.current) {
        checkedParamRef.current = true;
        showToast('Khóa học này đã được xử lý', 'info');
      }
      setSelectedCourse(null);
    }
  }, [courses, loading, targetCourseId, selectedCourse, showToast]);

  // Auto-scroll to selected course in sidebar
  useEffect(() => {
    if (selectedCourse?.id) {
      const el = document.getElementById(`pending-course-${selectedCourse.id}`);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedCourse?.id]);

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
    const reasonPrompt = (!isDeleteRequest && typeof window !== 'undefined' && window.prompt)
      ? window.prompt('Nhập lý do từ chối (tùy chọn):', '')
      : null;

    confirm({
      title: isDeleteRequest ? 'Từ chối yêu cầu xóa khóa học' : 'Từ chối khóa học',
      message: isDeleteRequest
        ? `Bạn có chắc muốn từ chối yêu cầu xóa và tiếp tục giữ lại khóa học "${course.title}" trên hệ thống ở trạng thái hoạt động?`
        : `Bạn có chắc muốn từ chối yêu cầu xuất bản của khóa học này để giảng viên bổ sung thêm nội dung?${reasonPrompt ? ` (Lý do: ${reasonPrompt})` : ''}`,
      confirmText: isDeleteRequest ? 'Từ chối xóa & Giữ lại' : 'Xác nhận từ chối',
      isDanger: !isDeleteRequest,
      onConfirm: async () => {
        try {
          await rejectMutation.mutateAsync({ id: course.id, reason: reasonPrompt || undefined });
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
                    id={`pending-course-${course.id}`}
                    onClick={() => {
                      setSelectedCourse(course);
                      setActiveTab('overview');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#16324F] shadow-sm ring-2 ring-[#16324F]'
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
                      Giảng viên phụ trách đã gửi yêu cầu xóa hoặc gỡ bỏ khóa học này khỏi hệ thống. Vui lòng rà soát số lượng học viên đã ghi danh để quyết định phê duyệt gỡ bỏ hoặc từ chối giữ lại.
                    </p>
                  </div>
                </div>
              )}

              {/* Title & Action Buttons Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E4E4E0]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      ID: #{selectedCourse.id}
                    </span>
                    <span className="text-[11px] text-[#5E5E5E]">
                      Gửi lúc: {formatDate(selectedCourse.createdAt)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold font-serif text-[#001D37] leading-snug">
                    {selectedCourse.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReject(selectedCourse)}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>{selectedCourse.status === 'PENDING_DELETE' ? 'Từ chối xóa' : 'Từ chối duyệt'}</span>
                  </button>

                  <button
                    onClick={() => handleApprove(selectedCourse)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>{selectedCourse.status === 'PENDING_DELETE' ? 'Đồng ý xóa' : 'Phê duyệt xuất bản'}</span>
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-6 border-b border-[#E4E4E0] text-xs font-medium text-[#5E5E5E]">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'border-[#16324F] text-[#16324F] font-bold'
                      : 'border-transparent hover:text-[#1A1C1E]'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Tổng quan & Giảng viên</span>
                </button>

                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'curriculum'
                      ? 'border-[#16324F] text-[#16324F] font-bold'
                      : 'border-transparent hover:text-[#1A1C1E]'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Đề cương bài học ({sections.length} chương)</span>
                </button>

                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'quiz'
                      ? 'border-[#16324F] text-[#16324F] font-bold'
                      : 'border-transparent hover:text-[#1A1C1E]'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Đề thi trắc nghiệm ({totalQuestions} câu hỏi)</span>
                </button>
              </div>

              {/* Tab Content: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl text-center">
                      <span className="text-[10px] text-[#5E5E5E] uppercase font-semibold">Chương học</span>
                      <p className="text-base font-bold font-serif text-[#001D37] mt-0.5">{sections.length}</p>
                    </div>

                    <div className="p-3 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl text-center">
                      <span className="text-[10px] text-[#5E5E5E] uppercase font-semibold">Bài giảng</span>
                      <p className="text-base font-bold font-serif text-[#001D37] mt-0.5">{totalLessons}</p>
                    </div>

                    <div className="p-3 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl text-center">
                      <span className="text-[10px] text-[#5E5E5E] uppercase font-semibold">Thời lượng</span>
                      <p className="text-base font-bold font-serif text-[#001D37] mt-0.5">{totalDurationMinutes} phút</p>
                    </div>

                    <div className="p-3 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl text-center">
                      <span className="text-[10px] text-[#5E5E5E] uppercase font-semibold">Học phí</span>
                      <p className="text-base font-bold font-serif text-[#16324F] mt-0.5">{formatCurrency(selectedCourse.price)}</p>
                    </div>
                  </div>

                  {/* Thumbnail & Description */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-5 rounded-xl overflow-hidden border border-[#E4E4E0] aspect-video bg-slate-100 shadow-2xs">
                      <img
                        src={getImageUrl(selectedCourse.thumbnailUrl, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600')}
                        alt={selectedCourse.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="md:col-span-7 space-y-4 text-xs">
                      <div>
                        <h4 className="font-bold text-[#001D37] uppercase tracking-wider text-[11px] mb-1.5">
                          Mô tả tổng quan khóa học
                        </h4>
                        <p className="text-[#5E5E5E] leading-relaxed whitespace-pre-line bg-[#FAF9FC] p-3.5 rounded-xl border border-[#E4E4E0]">
                          {selectedCourse.description || 'Chưa có mô tả chi tiết cho khóa học này.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <span className="text-[10px] font-semibold text-[#5E5E5E] uppercase">Danh mục</span>
                          <p className="font-bold text-[#001D37] mt-0.5">{selectedCourse.categoryName || 'Mặc định'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-[#5E5E5E] uppercase">Học viên đã ghi danh</span>
                          <p className="font-bold text-[#001D37] mt-0.5">{selectedCourse.enrolledCount || 0} học viên</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instructor Bio Box */}
                  <div className="p-4 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(selectedCourse.instructor?.avatarUrl, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120')}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-[#E4E4E0]"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Hồ sơ Giảng viên</span>
                        <h4 className="font-serif font-bold text-sm text-[#001D37]">
                          {selectedCourse.instructorName || selectedCourse.instructor?.fullName || 'Giảng viên chưa cập nhật'}
                        </h4>
                        <p className="text-[11px] text-[#5E5E5E]">{selectedCourse.instructor?.email || 'N/A'}</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-white border border-[#E4E4E0] rounded-lg text-xs font-semibold text-[#16324F]">
                      Quyền: {selectedCourse.instructor?.role || 'ROLE_INSTRUCTOR'}
                    </span>
                  </div>

                </div>
              )}

              {/* Tab Content: CURRICULUM */}
              {activeTab === 'curriculum' && (
                <div className="space-y-4 animate-fade-in">
                  {sections.length === 0 ? (
                    <div className="py-12 text-center bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl">
                      <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-[#5E5E5E]">Khóa học này chưa có chương học nào được tạo.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sections.map((section, sIdx) => (
                        <div key={section.id || sIdx} className="border border-[#E4E4E0] rounded-xl overflow-hidden bg-white shadow-2xs">
                          {/* Section Header */}
                          <div className="p-3.5 bg-[#FAF9FC] border-b border-[#E4E4E0] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-[#16324F] text-white rounded text-[10px] font-bold flex items-center justify-center">
                                {sIdx + 1}
                              </span>
                              <h4 className="text-xs font-bold text-[#001D37]">
                                {section.title}
                              </h4>
                            </div>
                            <span className="text-[11px] text-[#5E5E5E] font-medium">
                              {section.lessons?.length || 0} bài giảng
                            </span>
                          </div>

                          {/* Lessons inside Section */}
                          <div className="divide-y divide-[#E4E4E0]">
                            {(!section.lessons || section.lessons.length === 0) ? (
                              <p className="p-3 text-[11px] text-[#5E5E5E] italic">Chưa có bài giảng nào trong chương này.</p>
                            ) : (
                              section.lessons.map((lesson, lIdx) => (
                                <div key={lesson.id || lIdx} className="p-3 pl-8 flex items-center justify-between text-xs hover:bg-[#FAF9FC]">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Video className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    <span className="truncate text-[#1A1C1E]">
                                      {lIdx + 1}. {lesson.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0 text-[11px] text-[#5E5E5E]">
                                    <span>{lesson.durationMinutes || 0} phút</span>
                                    {lesson.contentUrl && (
                                      <a
                                        href={lesson.contentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                                      >
                                        <span>Xem học liệu</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: QUIZ */}
              {activeTab === 'quiz' && (
                <div className="space-y-4 animate-fade-in">
                  {!quiz ? (
                    <div className="py-12 text-center bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl">
                      <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
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

export default CourseApprovalPage;
