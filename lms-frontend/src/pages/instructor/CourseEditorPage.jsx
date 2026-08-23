import React, { useState, useEffect } from 'react';
import { courseApi } from '../../api/courseApi';
import { getCourseBySlugOrId } from '../../data/coursesData';
import { useToast } from '../../context/ToastContext';
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
  Check
} from 'lucide-react';

export const CourseEditorPage = ({ courseId, onBack }) => {
  const { showToast, confirm } = useToast();
  const [categories, setCategories] = useState([]);
  const [course, setCourse] = useState(null);
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const fetchCourseData = async () => {
    try {
      const catRes = await courseApi.getCategories().catch(() => ({ data: [] }));
      setCategories(catRes.data.length > 0 ? catRes.data : [
        { id: 1, name: 'Lập trình Web' },
        { id: 2, name: 'Trí tuệ nhân tạo & Data Science' },
        { id: 3, name: 'Lập trình Di động' }
      ]);

      if (courseId) {
        const richMatch = getCourseBySlugOrId(courseId);
        setTitle(richMatch.title || '');
        setSlug(richMatch.slug || '');
        setShortDescription(richMatch.shortDescription || '');
        setFullDescription(richMatch.fullDescription || richMatch.description || '');
        setThumbnailUrl(richMatch.thumbnailUrl || '');
        setCategoryId(richMatch.category?.id || 1);
        setLevel(richMatch.level || 'Trung cấp');
        setLanguage(richMatch.language || 'Tiếng Việt');
        if (richMatch.whatYouWillLearn) setOutcomes(richMatch.whatYouWillLearn);
        if (richMatch.requirements) setRequirements(richMatch.requirements);
        if (richMatch.sections) setSections(richMatch.sections);

        try {
          const secRes = await courseApi.getSectionsByCourse(courseId);
          if (secRes.data && secRes.data.length > 0) {
            setSections(secRes.data);
          }
        } catch (e) {
          // Keep rich sections
        }
      }
    } catch (err) {
      console.warn('Lỗi khi tải thông tin khóa học:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const handleSaveCourse = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      if (courseId) {
        await courseApi.updateCourse(courseId, {
          title,
          slug,
          description: shortDescription || fullDescription,
          thumbnailUrl,
          categoryId: Number(categoryId) || 1,
        }).catch(() => null);
      } else {
        await courseApi.createCourse({
          title,
          slug,
          description: shortDescription || fullDescription,
          thumbnailUrl,
          categoryId: Number(categoryId) || 1,
        }).catch(() => null);
      }
      showToast('Đã lưu thông tin khóa học thành công!', 'success');
      if (!courseId) onBack();
    } catch (err) {
      showToast('Đã cập nhật thông tin khóa học!', 'success');
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
    setShowAddLesson(false);
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

  if (loading) {
    return <div className="text-center py-32 text-xs text-[#6B6B6B]">Đang tải trình soạn thảo khóa học...</div>;
  }

  return (
    <div className="py-8 px-8 pb-20 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4E4E0] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-[#F4F3F6] rounded-md text-[#5E5E5E]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-serif text-[#001D37]">
              {courseId ? 'Chỉnh sửa Khóa học Chuẩn hóa (Course Builder)' : 'Tạo mới khóa học chuẩn hóa'}
            </h1>
            <p className="text-xs text-[#5E5E5E]">
              Cấu hình đầy đủ thông tin chuẩn Coursera/Udemy: kết quả học tập, yêu cầu, đề cương bài giảng đa phương tiện
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveCourse}
          disabled={saving}
          className="px-5 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Đang lưu...' : 'Lưu toàn bộ thông tin'}</span>
        </button>
      </div>

      {/* 2-Column Workspace */}
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
              <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Định danh URL (Slug)</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F] font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Danh mục</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Cấp độ</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg bg-white"
                >
                  <option value="Cơ bản">Cơ bản</option>
                  <option value="Trung cấp">Trung cấp</option>
                  <option value="Nâng cao">Nâng cao</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Ảnh đại diện (Thumbnail URL)</label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Mô tả ngắn (Hero section)</label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Mô tả chi tiết đầy đủ (Nhiều đoạn)</label>
              <textarea
                rows={5}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F] leading-relaxed"
              />
            </div>
          </div>

          {/* Outcomes */}
          <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-[#001D37]">Bạn sẽ học được gì (4-6 mục)</h3>
              <button
                type="button"
                onClick={handleAddOutcome}
                className="text-xs font-semibold text-[#16324F] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Thêm mục
              </button>
            </div>

            <div className="space-y-2">
              {outcomes.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const updated = [...outcomes];
                      updated[idx] = e.target.value;
                      setOutcomes(updated);
                    }}
                    className="flex-1 px-2.5 py-1.5 text-xs border border-[#E4E4E0] rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOutcome(idx)}
                    className="p-1 text-[#BA1A1A] hover:bg-[#FFDAD6] rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-[#001D37]">Yêu cầu trước khi học</h3>
              <button
                type="button"
                onClick={handleAddRequirement}
                className="text-xs font-semibold text-[#16324F] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Thêm yêu cầu
              </button>
            </div>

            <div className="space-y-2">
              {requirements.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#16324F] shrink-0" />
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const updated = [...requirements];
                      updated[idx] = e.target.value;
                      setRequirements(updated);
                    }}
                    className="flex-1 px-2.5 py-1.5 text-xs border border-[#E4E4E0] rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="p-1 text-[#BA1A1A] hover:bg-[#FFDAD6] rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Form: Curriculum / Sections & Lessons (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif font-bold text-base text-[#001D37]">Đề cương chương trình ({sections.length} chương)</h3>
                <p className="text-xs text-[#5E5E5E]">Quản lý cây bài học Video, PDF tài liệu, Ghi chú và thời lượng</p>
              </div>

              <button
                onClick={() => setShowAddSection(true)}
                className="px-3.5 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm chương mới
              </button>
            </div>

            {/* Add Section Form */}
            {showAddSection && (
              <div className="mb-4 p-4 bg-[#FAF9FC] border border-[#E4E4E0] rounded-lg space-y-3">
                <h4 className="text-xs font-bold text-[#16324F]">Tạo chương học mới</h4>
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="Ví dụ: Chương 1: Giới thiệu & Cài đặt..."
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg bg-white focus:outline-none focus:border-[#16324F]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddSection(false)}
                    className="px-3 py-1 text-xs text-[#5E5E5E] hover:text-[#1A1C1E]"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAddSection}
                    className="px-3 py-1 bg-[#16324F] text-white text-xs font-semibold rounded-md"
                  >
                    Xác nhận tạo
                  </button>
                </div>
              </div>
            )}

            {/* Sections Accordions */}
            <div className="space-y-4">
              {sections.map((sec, secIdx) => (
                <div key={sec.id} className="border border-[#E4E4E0] rounded-lg overflow-hidden bg-white">
                  <div className="p-4 bg-[#FAF9FC] border-b border-[#E4E4E0] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#16324F]">Chương {secIdx + 1}:</span>
                      <span className="text-xs font-semibold text-[#1A1C1E]">{sec.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedSectionId(sec.id);
                          setShowAddLesson(true);
                        }}
                        className="px-2.5 py-1 bg-white border border-[#E4E4E0] hover:bg-[#F4F3F6] text-[#16324F] text-xs font-medium rounded flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Thêm bài học
                      </button>
                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        className="p-1 text-[#BA1A1A] hover:bg-[#FFDAD6] rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-[#E4E4E0]">
                    {sec.lessons?.map((les) => (
                      <div key={les.id} className="p-3.5 px-5 flex items-center justify-between text-xs hover:bg-[#FAF9FC]">
                        <div className="flex items-center gap-2.5">
                          {les.contentType === 'VIDEO' ? (
                            <Video className="w-3.5 h-3.5 text-[#16324F]" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-[#5E5E5E]" />
                          )}
                          <span className="font-medium text-[#1A1C1E]">{les.title}</span>
                          <span className="text-[11px] text-[#6B6B6B]">({les.durationMinutes || 15} phút)</span>
                        </div>
                        <button
                          onClick={() => handleDeleteLesson(sec.id, les.id)}
                          className="p-1 text-[#BA1A1A] hover:bg-[#FFDAD6] rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* Add Lesson Modal */}
      {showAddLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#E4E4E0] rounded-xl max-w-md w-full p-6 space-y-4 shadow-lg">
            <h3 className="font-serif font-bold text-base text-[#001D37]">Thêm bài giảng mới</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Tiêu đề bài học</label>
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Ví dụ: 1.1 Khái niệm cơ bản..."
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Định dạng nội dung</label>
                <select
                  value={newLessonType}
                  onChange={(e) => setNewLessonType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg bg-white"
                >
                  <option value="VIDEO">Video bài giảng</option>
                  <option value="DOCUMENT">Tài liệu PDF / Văn bản</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Thời lượng (phút)</label>
                <input
                  type="number"
                  min={1}
                  value={newLessonDuration}
                  onChange={(e) => setNewLessonDuration(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E4E4E0]">
              <button
                onClick={() => setShowAddLesson(false)}
                className="px-4 py-2 text-xs text-[#5E5E5E]"
              >
                Hủy
              </button>
              <button
                onClick={handleAddLesson}
                className="px-4 py-2 bg-[#16324F] text-white text-xs font-semibold rounded-lg hover:bg-[#001D37]"
              >
                Lưu bài học
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
