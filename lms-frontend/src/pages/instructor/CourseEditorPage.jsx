import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { courseApi } from '../../api/courseApi';
import { 
  useCourseDetail, 
  useCategories, 
  useUpdateCourse, 
  useTeachingCourses,
  useSubmitForReview 
} from '../../hooks/useCourses';
import { useToast } from '../../context/ToastContext';
import { ImageUploadInput } from '../../components/common/ImageUploadInput';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Video, 
  FileText, 
  Clock, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Sparkles, 
  HelpCircle, 
  Globe, 
  Check, 
  AlertCircle, 
  Edit3,
  Send,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const CourseEditorPage = ({ courseId: courseIdProp, onBack }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast, confirm } = useToast();

  const { data: teachingCourses = [], isLoading: loadingTeaching } = useTeachingCourses();
  const { data: categories = [] } = useCategories();

  const queryCourseId = searchParams.get('courseId');
  const courseId = courseIdProp || queryCourseId || (teachingCourses[0]?.id ? String(teachingCourses[0].id) : null);

  const { data: courseDetail, isLoading: loadingCourse, isError: isErrorCourse } = useCourseDetail(courseId);
  const updateCourseMutation = useUpdateCourse();
  const submitReviewMutation = useSubmitForReview();

  const handleSubmitReview = () => {
    if (!courseId) return;
    confirm({
      title: 'Gửi kiểm duyệt khóa học',
      message: 'Bạn có chắc chắn muốn gửi khóa học này lên Ban Quản trị để xét duyệt xuất bản công khai cho học viên?',
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

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/instructor/dashboard');
  };

  // Auto set courseId in query param if missing and teaching courses exist
  useEffect(() => {
    if (!queryCourseId && !courseIdProp && !loadingTeaching && teachingCourses.length > 0) {
      setSearchParams({ courseId: String(teachingCourses[0].id) }, { replace: true });
    }
  }, [queryCourseId, courseIdProp, loadingTeaching, teachingCourses, setSearchParams]);

  const [sections, setSections] = useState([]);
  
  // Basic metadata
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState('Trung cấp');
  const [language, setLanguage] = useState('Tiếng Việt');
  const [price, setPrice] = useState('');

  // Rich outcomes & requirements
  const [outcomes, setOutcomes] = useState([
    'Thiết kế CSDL chuẩn hóa 11 thực thể trên MySQL 8.0.',
    'Xây dựng kiến trúc Monolithic 3-Layer với Spring Boot 3 & Java 21.',
    'Bảo mật JWT và phân quyền Role-Based (Student, Instructor, Admin).',
    'Xây dựng giao diện Single Page Application với React 19 & Tailwind CSS.'
  ]);
  const [requirements, setRequirements] = useState([
    'Kiến thức căn bản về lập trình Java và JavaScript.',
    'Hiểu biết cơ bản về cơ sở dữ liệu quan hệ SQL.'
  ]);

  const [saving, setSaving] = useState(false);

  // Populate form state when courseDetail loads from API
  useEffect(() => {
    if (courseDetail) {
      setTitle(courseDetail.title || '');
      setSlug(courseDetail.slug || '');
      setShortDescription(courseDetail.description || '');
      setFullDescription(courseDetail.description || '');
      setThumbnailUrl(courseDetail.thumbnailUrl || '');
      setCategoryId(courseDetail.category?.id || '');
      setLevel(courseDetail.level || 'Trung cấp');
      setLanguage(courseDetail.language || 'Tiếng Việt');
      setPrice(courseDetail.price !== undefined && courseDetail.price !== null ? String(courseDetail.price) : '0');
      if (courseDetail.sections && courseDetail.sections.length > 0) {
        setSections(courseDetail.sections);
      }
    }
  }, [courseDetail]);

  // Section Modal / Inputs
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);

  // Lesson Modal / Inputs
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('VIDEO');
  const [newLessonUrl, setNewLessonUrl] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState(15);
  const [showAddLesson, setShowAddLesson] = useState(false);

  // Fetch sections from API when courseId changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!courseId) return;
      try {
        const res = await courseApi.getCourseSections(courseId);
        if (res.data && res.data.length > 0) {
          setSections(res.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách chương/bài học:', err);
      }
    };
    fetchSections();
  }, [courseId]);

  const handleSaveCourse = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      if (courseId) {
        await updateCourseMutation.mutateAsync({
          id: courseId,
          data: {
            title,
            slug,
            description: shortDescription || fullDescription,
            thumbnailUrl,
            categoryId: Number(categoryId) || 1,
            price: price !== '' ? Number(price) : 0,
          },
        });
      } else {
        await courseApi.createCourse({
          title,
          slug,
          description: shortDescription || fullDescription,
          thumbnailUrl,
          categoryId: Number(categoryId) || 1,
          price: price !== '' ? Number(price) : 0,
        });
      }
      showToast('Đã lưu thông tin khóa học thành công!', 'success');
      if (!courseId) onBack();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi lưu thông tin khóa học!', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddOutcome = () => {
    setOutcomes([...outcomes, 'Kết quả học tập mới...']);
  };

  const handleRemoveOutcome = (idx) => {
    setOutcomes(outcomes.filter((_, i) => i !== idx));
  };

  const handleAddRequirement = () => {
    setRequirements([...requirements, 'Yêu cầu kiến thức mới...']);
  };

  const handleRemoveRequirement = (idx) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    const newSec = {
      id: Date.now(),
      title: newSectionTitle.trim(),
      lessons: []
    };
    setSections([...sections, newSec]);
    setNewSectionTitle('');
    setShowAddSection(false);
    showToast('Đã tạo chương học mới!', 'success');
  };

  const handleDeleteSection = (secId) => {
    confirm({
      title: 'Xóa chương học',
      message: 'Bạn có chắc chắn muốn xóa chương này và toàn bộ bài học bên trong?',
      confirmText: 'Xóa chương',
      isDanger: true,
      onConfirm: () => {
        setSections(sections.filter((s) => s.id !== secId));
        showToast('Đã xóa chương học!', 'info');
      },
    });
  };

  const handleAddLesson = () => {
    if (!newLessonTitle.trim() || !selectedSectionId) return;
    const newLes = {
      id: Date.now(),
      title: newLessonTitle.trim(),
      contentType: newLessonType,
      contentUrl: newLessonUrl.trim() || 'https://www.w3schools.com/html/mov_bbb.mp4',
      durationMinutes: Number(newLessonDuration),
    };
    setSections(
      sections.map((s) =>
        s.id === selectedSectionId
          ? { ...s, lessons: [...(s.lessons || []), newLes] }
          : s
      )
    );
    setNewLessonTitle('');
    setNewLessonUrl('');
    setNewLessonDuration(15);
    setShowAddLesson(false);
    showToast('Đã thêm bài giảng vào chương!', 'success');
  };

  const [editingLesson, setEditingLesson] = useState(null);

  const handleOpenEditLesson = (sectionId, lesson) => {
    setEditingLesson({
      sectionId,
      id: lesson.id,
      title: lesson.title,
      contentType: lesson.contentType || 'VIDEO',
      contentUrl: lesson.contentUrl || '',
      durationMinutes: lesson.durationMinutes || 15,
    });
  };

  const handleSaveEditedLesson = async () => {
    if (!editingLesson || !editingLesson.title.trim()) return;
    try {
      if (typeof editingLesson.id === 'number' && editingLesson.id < 1000000000000) {
        await courseApi.updateLesson(editingLesson.id, {
          title: editingLesson.title.trim(),
          contentType: editingLesson.contentType,
          contentUrl: editingLesson.contentUrl.trim() || 'https://www.w3schools.com/html/mov_bbb.mp4',
          durationMinutes: Number(editingLesson.durationMinutes) || 15,
          orderIndex: 1,
        });
      }

      setSections(
        sections.map((s) =>
          s.id === editingLesson.sectionId
            ? {
                ...s,
                lessons: (s.lessons || []).map((l) =>
                  l.id === editingLesson.id
                    ? {
                        ...l,
                        title: editingLesson.title.trim(),
                        contentType: editingLesson.contentType,
                        contentUrl: editingLesson.contentUrl.trim() || 'https://www.w3schools.com/html/mov_bbb.mp4',
                        durationMinutes: Number(editingLesson.durationMinutes) || 15,
                      }
                    : l
                ),
              }
            : s
        )
      );
      setEditingLesson(null);
      showToast('Đã cập nhật bài giảng thành công!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại', 'error');
    }
  };

  const handleDeleteLesson = (secId, lessonId) => {
    setSections(
      sections.map((s) =>
        s.id === secId
          ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
          : s
      )
    );
  };

  return (
    <div className="py-8 px-8 pb-20 space-y-8">
      
      {/* Header & Course Switcher - ALWAYS VISIBLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E0] pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 hover:bg-[#F4F3F6] rounded-md text-[#5E5E5E] cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold font-serif text-[#001D37]">
                {courseId ? 'Chỉnh sửa Khóa học (Course Builder)' : 'Tạo mới khóa học'}
              </h1>
              {courseDetail?.status && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#F4F3F6] text-[#16324F] border border-[#E4E4E0]">
                  {courseDetail.status}
                </span>
              )}
            </div>
            <p className="text-xs text-[#5E5E5E]">
              Cấu hình thông tin chuẩn Coursera/Udemy: bài học, video và đề cương
            </p>
          </div>
        </div>

        {/* Right Actions: Course Selector Dropdown + Save Button */}
        <div className="flex items-center gap-3 flex-wrap">
          {teachingCourses.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#16324F] whitespace-nowrap">Đang chọn khóa học:</label>
              <select
                value={courseId || ''}
                onChange={(e) => setSearchParams({ courseId: e.target.value })}
                className="px-3 py-2 text-xs font-semibold bg-white border border-[#E4E4E0] rounded-xl text-[#001D37] focus:outline-none focus:border-[#16324F] shadow-2xs cursor-pointer max-w-xs truncate"
              >
                {teachingCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleSaveCourse}
            disabled={saving || !courseId}
            className="px-5 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Đang lưu...' : 'Lưu toàn bộ thông tin'}</span>
          </button>
        </div>
      </div>

      {/* Approval Status Banner (UX Notification) */}
      {courseDetail && (
        <>
          {courseDetail.status === 'DRAFT' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-900 shadow-2xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    Khóa học đang ở trạng thái Bản nháp (DRAFT)
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Khóa học này chưa được xuất bản, học viên sẽ không thấy được cho đến khi bạn gửi duyệt và được Admin phê duyệt.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submitReviewMutation.isPending}
                className="px-4 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitReviewMutation.isPending ? 'Đang gửi...' : 'Gửi duyệt ngay'}</span>
              </button>
            </div>
          )}

          {courseDetail.status === 'REJECTED' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-red-900 shadow-2xs">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-900">
                    Khóa học đã bị Ban Quản trị từ chối phê duyệt (REJECTED)
                  </p>
                  <p className="text-[11px] text-red-800 mt-0.5 leading-relaxed">
                    Vui lòng rà soát lại bài giảng, video và nội dung đề cương trước khi gửi yêu cầu xét duyệt lại.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submitReviewMutation.isPending}
                className="px-4 py-2 bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitReviewMutation.isPending ? 'Đang gửi...' : 'Gửi duyệt lại'}</span>
              </button>
            </div>
          )}

          {courseDetail.status === 'PENDING' && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4.5 flex items-center gap-3 text-blue-900 shadow-2xs">
              <Clock className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-900">
                  Khóa học đang trong quá trình chờ Ban Quản trị xét duyệt (PENDING)
                </p>
                <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                  Khóa học sẽ tự động xuất hiện công khai trên trang Khám phá ngay sau khi Quản trị viên phê duyệt.
                </p>
              </div>
            </div>
          )}

          {courseDetail.status === 'PUBLISHED' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-emerald-900 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs font-medium text-emerald-900">
                Khóa học đã được xuất bản chính thức và đang hiển thị công khai tới toàn bộ học viên.
              </p>
            </div>
          )}
        </>
      )}

      {/* Body Area */}
      {!loadingTeaching && teachingCourses.length === 0 ? (
        <div className="py-24 px-8 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-white border border-[#E4E4E0] rounded-2xl flex items-center justify-center mx-auto text-[#16324F] shadow-sm">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-serif text-[#001D37]">Bạn chưa có khóa học nào</h2>
          <p className="text-xs text-[#5E5E5E]">
            Vui lòng tạo khóa học đầu tiên để bắt đầu xây dựng nội dung bài học và đề cương giảng dạy.
          </p>
          <button
            onClick={() => navigate('/instructor/courses/create')}
            className="mt-3 px-5 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tạo khóa học mới ngay
          </button>
        </div>
      ) : isErrorCourse ? (
        <div className="py-20 px-8 text-center max-w-md mx-auto space-y-4 bg-white border border-red-100 rounded-2xl shadow-xs">
          <div className="w-16 h-16 bg-red-50 text-[#BA1A1A] border border-red-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-serif text-[#001D37]">Không có quyền truy cập</h2>
          <p className="text-xs text-[#5E5E5E]">
            Bạn không có quyền chỉnh sửa khóa học này hoặc khóa học không tồn tại. Vui lòng chọn một khóa học khác từ dropdown ở trên.
          </p>
          {teachingCourses.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setSearchParams({ courseId: String(teachingCourses[0].id) })}
                className="px-4 py-2 bg-[#16324F] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
              >
                Chuyển về khóa học của bạn: {teachingCourses[0].title}
              </button>
            </div>
          )}
        </div>
      ) : courseId && loadingCourse && !courseDetail ? (
        <div className="text-center py-32 text-xs text-[#6B6B6B]">Đang tải thông tin khóa học...</div>
      ) : (
        /* 2-Column Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Form: Metadata, Outcomes, Requirements (1 Column) */}
          <div className="space-y-6">
            
            {/* Basic Info */}
            <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-3.5">
              <h3 className="font-serif font-bold text-base text-[#001D37]">Thông tin cơ bản</h3>

              <div>
                <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Tên khóa học</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Đường dẫn Slug (URL)</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Danh mục đào tạo</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F] bg-white cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Cấp độ</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F] bg-white cursor-pointer"
                  >
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Nâng cao">Nâng cao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Ngôn ngữ giảng dạy</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
                  />
                </div>
              </div>

              {/* Học phí */}
              <div>
                <label className="block text-xs font-medium text-[#1A1C1E] mb-1 flex items-center justify-between">
                  <span>Học phí (VNĐ)</span>
                  <span className="text-[11px] font-semibold text-[#16324F] bg-[#EFEDF0] px-2 py-0.5 rounded">
                    {price && Number(price) > 0 ? new Intl.NumberFormat('vi-VN').format(Number(price)) + '₫' : 'Miễn phí'}
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0 (Để trống = Miễn phí)"
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F] bg-white"
                />
                <p className="text-[10px] text-[#5E5E5E] mt-0.5">Nhập 0 hoặc để trống nếu là khóa học miễn phí</p>
              </div>

              <ImageUploadInput
                value={thumbnailUrl}
                onChange={(newUrl) => setThumbnailUrl(newUrl)}
                label="Ảnh bìa Thumbnail khóa học"
                placeholder="Nhập URL ảnh hoặc tải file ảnh từ máy..."
              />

              <div>
                <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Mô tả chi tiết tổng quan</label>
                <textarea
                  rows={4}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
                />
              </div>
            </div>

            {/* Outcomes */}
            <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="font-serif font-bold text-sm text-[#001D37]">Kết quả đạt được</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddOutcome}
                  className="text-xs text-[#16324F] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm
                </button>
              </div>

              <div className="space-y-2.5">
                {outcomes.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...outcomes];
                        updated[idx] = e.target.value;
                        setOutcomes(updated);
                      }}
                      className="flex-1 px-3 py-1.5 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOutcome(idx)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  <h3 className="font-serif font-bold text-sm text-[#001D37]">Yêu cầu đầu vào</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="text-xs text-[#16324F] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm
                </button>
              </div>

              <div className="space-y-2.5">
                {requirements.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...requirements];
                        updated[idx] = e.target.value;
                        setRequirements(updated);
                      }}
                      className="flex-1 px-3 py-1.5 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Workspace: Sections & Lessons Builder (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#E4E4E0] pb-4">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#001D37]">
                    Đề cương chi tiết & Bài giảng ({sections.length} Chương)
                  </h3>
                  <p className="text-xs text-[#5E5E5E]">
                    Tổ chức chương trình học theo từng Module/Chương bài giảng đa phương tiện
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddSection(true)}
                  className="px-4 py-2 bg-[#F4F3F6] hover:bg-[#E4E4E0] text-[#16324F] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm chương mới</span>
                </button>
              </div>

              {/* Add Section Form Modal/Inline */}
              {showAddSection && (
                <div className="bg-[#FAF9FC] border border-[#16324F]/20 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-[#001D37]">Tạo Chương học mới</h4>
                  <input
                    type="text"
                    placeholder="VD: Chương 1: Kiến trúc Nền tảng Spring Boot"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F] bg-white"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSection(false)}
                      className="px-3 py-1.5 text-xs text-[#5E5E5E] hover:bg-gray-100 rounded-lg cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="px-4 py-1.5 bg-[#16324F] text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Tạo chương
                    </button>
                  </div>
                </div>
              )}

              {/* Section List */}
              <div className="space-y-4">
                {sections.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-[#C3C6CE] rounded-xl space-y-2">
                    <Layers className="w-8 h-8 text-[#5E5E5E] mx-auto" />
                    <p className="text-xs font-semibold text-[#1A1C1E]">Chưa có chương học nào</p>
                    <p className="text-[11px] text-[#5E5E5E]">Bấm "Thêm chương mới" để bắt đầu xây dựng đề cương.</p>
                  </div>
                ) : (
                  sections.map((section, sIdx) => (
                    <div key={section.id || sIdx} className="border border-[#E4E4E0] rounded-xl overflow-hidden shadow-2xs">
                      
                      {/* Section Header */}
                      <div className="bg-[#FAF9FC] px-4 py-3 flex items-center justify-between border-b border-[#E4E4E0]">
                        <div className="flex items-center gap-2.5">
                          <Layers className="w-4 h-4 text-[#16324F]" />
                          <span className="text-xs font-bold text-[#001D37]">
                            {section.title}
                          </span>
                          <span className="text-[10px] text-[#5E5E5E] font-medium">
                            ({section.lessons?.length || 0} bài giảng)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSectionId(section.id);
                              setShowAddLesson(true);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-blue-50 text-[#16324F] text-[11px] font-semibold border border-[#E4E4E0] rounded-md flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Thêm bài giảng
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(section.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-md cursor-pointer"
                            title="Xóa chương này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Add Lesson Modal/Inline for this section */}
                      {showAddLesson && selectedSectionId === section.id && (
                        <div className="p-4 bg-blue-50/50 border-b border-blue-100 space-y-3">
                          <h5 className="text-xs font-bold text-[#16324F]">Thêm bài giảng mới vào {section.title}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-medium text-[#1A1C1E] mb-1">Tên bài giảng</label>
                              <input
                                type="text"
                                placeholder="VD: Bài 1: Cấu trúc Maven & Dependencies"
                                value={newLessonTitle}
                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-[#E4E4E0] rounded-lg bg-white focus:outline-none focus:border-[#16324F]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-[#1A1C1E] mb-1">Loại bài giảng</label>
                              <select
                                value={newLessonType}
                                onChange={(e) => setNewLessonType(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-[#E4E4E0] rounded-lg bg-white focus:outline-none focus:border-[#16324F] cursor-pointer"
                              >
                                <option value="VIDEO">Video MP4 / HLS</option>
                                <option value="DOCUMENT">Tài liệu Đọc / Markdown</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-[11px] font-medium text-[#1A1C1E] mb-1">URL Video / Nội dung tài liệu</label>
                              <input
                                type="text"
                                placeholder="VD: https://www.w3schools.com/html/mov_bbb.mp4"
                                value={newLessonUrl}
                                onChange={(e) => setNewLessonUrl(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-[#E4E4E0] rounded-lg bg-white focus:outline-none focus:border-[#16324F]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-[#1A1C1E] mb-1">Thời lượng (phút)</label>
                              <input
                                type="number"
                                min={1}
                                value={newLessonDuration}
                                onChange={(e) => setNewLessonDuration(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-[#E4E4E0] rounded-lg bg-white focus:outline-none focus:border-[#16324F]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddLesson(false);
                                setSelectedSectionId(null);
                              }}
                              className="px-3 py-1.5 text-xs text-[#5E5E5E] hover:bg-gray-200 rounded-lg cursor-pointer"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={handleAddLesson}
                              className="px-4 py-1.5 bg-[#16324F] text-white text-xs font-semibold rounded-lg cursor-pointer"
                            >
                              Lưu bài giảng
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Edit Lesson Modal/Inline for this section */}
                      {editingLesson && editingLesson.sectionId === section.id && (
                        <div className="p-4 bg-amber-50/50 border-b border-amber-200 space-y-3">
                          <h5 className="text-xs font-bold text-[#16324F]">Chỉnh sửa bài giảng</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-medium text-[#1A1C1E] mb-1">Tên bài giảng</label>
                              <input
                                type="text"
                                value={editingLesson.title}
                                onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs border border-[#E4E4E0] rounded-lg bg-white focus:outline-none focus:border-[#16324F]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-[#1A1C1E] mb-1">Loại bài giảng</label>
                              <select
                                value={editingLesson.contentType}
                                onChange={(e) => setEditingLesson({ ...editingLesson, contentType: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs border border-[#E4E4E0] rounded-lg bg-white focus:outline-none focus:border-[#16324F] cursor-pointer"
                              >
                                <option value="VIDEO">Video MP4 / HLS</option>
                                <option value="DOCUMENT">Tài liệu Đọc / Markdown</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-[11px] font-medium text-[#1A1C1E] mb-1">URL Video / Nội dung tài liệu</label>
                              <input
                                type="text"
                                value={editingLesson.contentUrl}
                                onChange={(e) => setEditingLesson({ ...editingLesson, contentUrl: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs border border-[#E4E4E0] rounded-lg bg-white focus:outline-none focus:border-[#16324F]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-[#1A1C1E] mb-1">Thời lượng (phút)</label>
                              <input
                                type="number"
                                min={1}
                                value={editingLesson.durationMinutes}
                                onChange={(e) => setEditingLesson({ ...editingLesson, durationMinutes: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs border border-[#E4E4E0] rounded-lg bg-white focus:outline-none focus:border-[#16324F]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingLesson(null)}
                              className="px-3 py-1.5 text-xs text-[#5E5E5E] hover:bg-gray-200 rounded-lg cursor-pointer"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveEditedLesson}
                              className="px-4 py-1.5 bg-[#16324F] text-white text-xs font-semibold rounded-lg cursor-pointer"
                            >
                              Cập nhật bài giảng
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Lessons List in Section */}
                      <div className="divide-y divide-[#E4E4E0]">
                        {(!section.lessons || section.lessons.length === 0) ? (
                          <div className="px-4 py-3 text-center text-[11px] text-[#5E5E5E] italic">
                            Chưa có bài giảng nào trong chương này. Bấm "Thêm bài giảng" để bắt đầu.
                          </div>
                        ) : (
                          section.lessons.map((lesson, lIdx) => (
                            <div key={lesson.id || lIdx} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                              <div
                                onClick={() => handleOpenEditLesson(section.id, lesson)}
                                className="flex items-center gap-3 flex-1 cursor-pointer"
                              >
                                {lesson.contentType === 'VIDEO' ? (
                                  <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                )}
                                <div>
                                  <div className="text-xs font-medium text-[#1A1C1E] hover:text-[#16324F]">
                                    {lesson.title}
                                  </div>
                                  <div className="text-[10px] text-[#5E5E5E] flex items-center gap-2">
                                    <span>{lesson.contentType}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      {lesson.durationMinutes || 10} phút
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditLesson(section.id, lesson)}
                                  className="p-1 text-gray-400 hover:text-[#16324F] hover:bg-gray-100 rounded cursor-pointer"
                                  title="Chỉnh sửa bài học"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(section.id, lesson.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                  title="Xóa bài học"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};
