import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../../api/courseApi';
import { useToast } from '../../context/ToastContext';
import { ImageUploadInput } from '../../components/common/ImageUploadInput';
import { getImageUrl } from '../../utils/imageUrl';
import { 
  Plus, 
  BookOpen, 
  ArrowLeft, 
  Save, 
  Image, 
  Layers, 
  CheckCircle2, 
  Globe, 
  Sparkles, 
  Check, 
  FileText,
  ListPlus,
  Trash2
} from 'lucide-react';

export const CourseCreateWizardPage = ({ onBack, onCourseCreated }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/instructor/dashboard');
  };

  const handleCreated = (newId) => {
    if (onCourseCreated) onCourseCreated(newId);
    else navigate(`/instructor/courses/editor?courseId=${newId}`);
  };

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [level, setLevel] = useState('Trung cấp');
  const [language, setLanguage] = useState('Tiếng Việt');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800');
  const [price, setPrice] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [learnItems, setLearnItems] = useState([
    'Làm chủ kiến trúc hệ thống và luồng xử lý dữ liệu chuẩn doanh nghiệp.',
    'Xây dựng RESTful API bảo mật và phân quyền vai trò người dùng.',
    'Thực hành đóng gói và triển khai ứng dụng thực tế.'
  ]);
  const [reqItems, setReqItems] = useState([
    'Kiến thức lập trình căn bản.',
    'Máy tính có kết nối Internet.'
  ]);
  const [saving, setSaving] = useState(false);

  // Auto generate slug from title
  const handleTitleChange = (val) => {
    setTitle(val);
    const autoSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setSlug(autoSlug);
  };

  const handleAddLearnItem = () => {
    setLearnItems((prev) => [...prev, '']);
  };

  const handleUpdateLearnItem = (idx, val) => {
    const updated = [...learnItems];
    updated[idx] = val;
    setLearnItems(updated);
  };

  const handleRemoveLearnItem = (idx) => {
    setLearnItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddReqItem = () => {
    setReqItems((prev) => [...prev, '']);
  };

  const handleUpdateReqItem = (idx, val) => {
    const updated = [...reqItems];
    updated[idx] = val;
    setReqItems(updated);
  };

  const handleRemoveReqItem = (idx) => {
    setReqItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 5) {
      showToast('Tiêu đề khóa học phải có ít nhất 5 ký tự!', 'warning');
      return;
    }
    if (!shortDescription.trim()) {
      showToast('Vui lòng nhập mô tả ngắn cho khóa học!', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || `course-${Date.now()}`,
        categoryId: Number(categoryId),
        description: shortDescription.trim(),
        thumbnailUrl: thumbnailUrl.trim(),
        price: price ? Number(price) : 0,
      };

      const res = await courseApi.createCourse(payload);
      if (!res.data?.id) {
        throw new Error('API không trả về ID khóa học hợp lệ!');
      }

      await queryClient.invalidateQueries({ queryKey: ['courses'] });

      showToast(
        'Khóa học đã được tạo ở dạng Bản nháp. Sau khi soạn xong bài giảng, hãy bấm "Gửi duyệt" để Admin xét duyệt trước khi hiển thị công khai cho học viên.',
        'success'
      );
      handleCreated(res.data.id);
    } catch (err) {
      console.error('Lỗi khi tạo khóa học:', err);
      showToast(err.response?.data?.message || err.message || 'Không thể tạo khóa học. Vui lòng thử lại!', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-10 px-8 max-w-5xl">
      <div className="space-y-8 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 border border-[#E4E4E0] hover:bg-white rounded-xl text-[#5E5E5E] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-xs font-semibold text-[#16324F] uppercase tracking-wider">Tác giả & Giáo trình</span>
              <h1 className="text-2xl font-bold font-serif text-[#001D37] mt-0.5">
                Khởi tạo Khóa học Mới
              </h1>
            </div>
          </div>
        </div>

        {/* Create Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#001D37] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#16324F]" />
                <span>1. Thông tin tổng quan khóa học</span>
              </h2>
              <p className="text-xs text-[#5E5E5E] mt-0.5">
                Các thông tin cơ bản giúp học viên tìm kiếm và nắm bắt chủ đề đào tạo
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Tên khóa học */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1A1C1E]">
                  Tên khóa học <span className="text-[#BA1A1A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ví dụ: Lập trình Web Fullstack với Spring Boot 3 & React 19"
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white font-medium"
                />
              </div>

              {/* Slug URL */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1A1C1E]">
                  Đường dẫn định danh (Slug URL) <span className="text-[10px] text-[#5E5E5E] font-normal">(Tự động sinh)</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="lap-trinh-web-fullstack-spring-boot-react"
                  className="w-full px-3.5 py-2 text-xs border border-[#E4E4E0] rounded-xl bg-[#FAF9FC] text-[#5E5E5E] font-mono"
                />
              </div>

              {/* Danh mục */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1A1C1E]">
                  Danh mục chuyên môn <span className="text-[#BA1A1A]">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl bg-white focus:outline-none focus:border-[#16324F]"
                >
                  <option value="1">Lập trình Web & Fullstack</option>
                  <option value="2">Trí tuệ nhân tạo & Data Science</option>
                  <option value="3">Lập trình Di động (React Native)</option>
                  <option value="4">Thiết kế UI/UX & Figma</option>
                  <option value="5">An toàn Thông tin & Web Security</option>
                </select>
              </div>

              {/* Cấp độ */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1A1C1E]">
                  Cấp độ khóa học
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl bg-white focus:outline-none focus:border-[#16324F]"
                >
                  <option value="Cơ bản">Cơ bản (Người mới bắt đầu)</option>
                  <option value="Trung cấp">Trung cấp (Đã có nền tảng)</option>
                  <option value="Nâng cao">Nâng cao (Chuyên gia / Master)</option>
                </select>
              </div>

              {/* Học phí */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1A1C1E] flex items-center justify-between">
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
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4E4E0] rounded-xl bg-white focus:outline-none focus:border-[#16324F]"
                />
              </div>

              {/* Mô tả ngắn */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1A1C1E]">
                  Mô tả tóm tắt (Short Description) <span className="text-[#BA1A1A]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Tóm tắt ngắn gọn 1-2 câu về mục tiêu và giá trị cốt lõi khóa học mang lại..."
                  className="w-full p-3.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white leading-relaxed"
                />
              </div>

              {/* Mô tả chi tiết */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1A1C1E]">
                  Giới thiệu chi tiết khóa học (Full Description)
                </label>
                <textarea
                  rows={4}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Mô tả lộ trình học tập từ con số 0, các công nghệ sử dụng, bài tập thực chiến..."
                  className="w-full p-3.5 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white leading-relaxed"
                />
              </div>

            </div>
          </div>

          {/* Section 2: Media & Thumbnail */}
          <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#001D37] flex items-center gap-2">
                <Image className="w-5 h-5 text-[#16324F]" />
                <span>2. Ảnh bìa đại diện khóa học (Cover Thumbnail)</span>
              </h2>
              <p className="text-xs text-[#5E5E5E] mt-0.5">
                Hình ảnh sắc nét giúp thu hút học viên trên trang Khám phá
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-56 aspect-video rounded-xl border border-[#E4E4E0] overflow-hidden bg-[#FAF9FC] shrink-0 shadow-xs">
                <img
                  src={getImageUrl(thumbnailUrl, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800')}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800';
                  }}
                />
              </div>

              <div className="flex-1 space-y-3 w-full">
                <ImageUploadInput
                  value={thumbnailUrl}
                  onChange={(newUrl) => setThumbnailUrl(newUrl)}
                  label="URL hình ảnh hoặc tải file ảnh lên"
                  placeholder="https://images.unsplash.com/... hoặc chọn file từ máy"
                />
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="text-[#5E5E5E] self-center">Mẫu ảnh gợi ý:</span>
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800')}
                    className="px-2 py-0.5 bg-[#FAF9FC] border border-[#E4E4E0] rounded text-[#16324F] hover:border-[#16324F] cursor-pointer"
                  >
                    Web Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800')}
                    className="px-2 py-0.5 bg-[#FAF9FC] border border-[#E4E4E0] rounded text-[#16324F] hover:border-[#16324F] cursor-pointer"
                  >
                    AI / Python
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl('https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800')}
                    className="px-2 py-0.5 bg-[#FAF9FC] border border-[#E4E4E0] rounded text-[#16324F] hover:border-[#16324F] cursor-pointer"
                  >
                    Mobile App
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Learning Outcomes & Prerequisites */}
          <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#001D37] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#16324F]" />
                <span>3. Mục tiêu đầu ra & Yêu cầu học viên</span>
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-2">
                  Bạn sẽ học được gì? (Learning Outcomes)
                </label>
                <div className="space-y-2">
                  {learnItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateLearnItem(idx, e.target.value)}
                        placeholder="Mục tiêu kiến thức đạt được..."
                        className="flex-1 px-3 py-2 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white"
                      />
                      {learnItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLearnItem(idx)}
                          className="p-2 text-[#5E5E5E] hover:text-[#BA1A1A] rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddLearnItem}
                    className="inline-flex items-center gap-1.5 text-xs text-[#16324F] font-semibold hover:underline pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm mục tiêu học tập
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E4E4E0]">
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-2">
                  Yêu cầu trước khi tham gia khóa học (Prerequisites)
                </label>
                <div className="space-y-2">
                  {reqItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#16324F] shrink-0 mx-1"></div>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateReqItem(idx, e.target.value)}
                        placeholder="Yêu cầu kiến thức đầu vào..."
                        className="flex-1 px-3 py-2 text-xs border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#16324F] bg-white"
                      />
                      {reqItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveReqItem(idx)}
                          className="p-2 text-[#5E5E5E] hover:text-[#BA1A1A] rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddReqItem}
                    className="inline-flex items-center gap-1.5 text-xs text-[#16324F] font-semibold hover:underline pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm yêu cầu đầu vào
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="w-full sm:w-auto px-6 py-2.5 border border-[#E4E4E0] hover:bg-white text-[#5E5E5E] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu khóa học...' : 'Lưu & Chuyển sang Soạn bài học & Đề cương'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
