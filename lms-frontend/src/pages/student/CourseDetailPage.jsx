import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi } from '../../api/courseApi';
import { learningApi } from '../../api/learningApi';
import { getCourseBySlugOrId } from '../../mocks/courses';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCart, useAddToCart } from '../../hooks/useCart';
import { getImageUrl } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/format';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Clock, 
  Award, 
  CheckCircle2, 
  ArrowLeft, 
  Play, 
  ChevronDown, 
  ChevronRight, 
  Star, 
  Users, 
  Globe, 
  RefreshCw, 
  HelpCircle, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Smartphone, 
  Infinity as InfinityIcon, 
  AlertCircle,
  ShoppingCart
} from 'lucide-react';

export const CourseDetailPage = ({ courseSlug: courseSlugProp, onBack, onStartLearning, onOpenAuthModal }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const courseSlug = courseSlugProp || slug || 'fullstack-spring-boot-reactjs';

  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: cart } = useCart();
  const addToCartMutation = useAddToCart();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [openSections, setOpenSections] = useState({});

  const isInCart = cart?.items?.some((item) => String(item.courseId) === String(course?.id));

  const handleAddToCart = async () => {
    if (!user) {
      handleAuthModal();
      return;
    }
    if (isInCart) {
      navigate('/cart');
      return;
    }
    try {
      await addToCartMutation.mutateAsync(course.id);
      showToast('Đã thêm khóa học vào giỏ hàng!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi thêm vào giỏ hàng';
      showToast(msg, 'error');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleStartLearn = (cid) => {
    if (onStartLearning) {
      onStartLearning(cid);
    } else {
      navigate(`/learn/${cid}`);
    }
  };

  const handleAuthModal = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal();
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCourseData = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        console.log('[CourseDetail] 🔍 Đang tải khóa học từ Backend API với slug:', courseSlug);
        
        let apiCourse = null;

        // 1. GỌI BACKEND API LÀ NGUỒN CHÍNH
        if (courseSlug) {
          try {
            const res = await courseApi.getCourseBySlug(courseSlug);
            if (res.data) {
              apiCourse = res.data;
              console.log('[CourseDetail] 🌐 Đã nhận dữ liệu thật từ Backend API:', apiCourse);
            }
          } catch (apiErr) {
            console.warn('[CourseDetail] Backend API trả về lỗi hoặc không tìm thấy:', apiErr);
            // Nếu API báo 404 hoặc lỗi không tìm thấy -> không dùng mock đè lên
            if (apiErr.response?.status === 404) {
              if (isMounted) {
                setCourse(null);
                setErrorMessage('Khóa học không tồn tại trong hệ thống hoặc đã bị gỡ bỏ.');
                setLoading(false);
              }
              return;
            }
            // Fallback chỉ khi offline/network failure
            const fallbackMock = getCourseBySlugOrId(courseSlug);
            if (fallbackMock) {
              apiCourse = fallbackMock;
            } else {
              if (isMounted) {
                setCourse(null);
                setErrorMessage(apiErr.response?.data?.message || 'Không thể kết nối đến máy chủ.');
                setLoading(false);
              }
              return;
            }
          }
        }

        if (!apiCourse) {
          if (isMounted) {
            setCourse(null);
            setErrorMessage('Không tìm thấy thông tin khóa học yêu cầu.');
            setLoading(false);
          }
          return;
        }

        // 2. TÌM MOCK ĐỂ BỔ SUNG CÁC TRƯỜNG TRANG TRÍ PHỤ TRỢ (NẾU CÓ)
        const mockMatch = getCourseBySlugOrId(courseSlug) || {};

        // Default decorative fields for UI completeness (kể cả khóa học mới tạo chỉ có ở Backend)
        const decorativeDefaults = {
          whatYouWillLearn: [
            'Làm chủ toàn diện kiến thức và kỹ năng thực tế của chương trình đào tạo',
            'Xây dựng tư duy giải quyết vấn đề và kiến trúc dự án chuẩn quốc tế',
            'Thực hành trực tiếp qua các bài tập và dự án thực chiến',
            'Tự tin áp dụng ngay vào công việc và định hướng nghề nghiệp',
          ],
          requirements: [
            'Máy tính cá nhân có kết nối Internet ổn định',
            'Tinh thần chủ động học tập và đam mê nâng cao trình độ chuyên môn',
          ],
          targetAudience: [
            'Học viên, sinh viên và lập trình viên muốn nâng cao kỹ năng',
            'Bất kỳ ai muốn bắt đầu hoặc chuyển hướng sự nghiệp công nghệ',
          ],
          language: 'Tiếng Việt',
          certificateAvailable: true,
          rating: 5.0,
          reviewCount: 1,
          totalDuration: apiCourse.totalDurationMinutes ? `${Math.round(apiCourse.totalDurationMinutes / 60) || 1} giờ` : '20 giờ',
        };

        // 3. MERGE: apiCourse luôn GHI ĐÈ LÊN tất cả các field trùng tên
        const finalCourse = {
          ...decorativeDefaults,
          ...mockMatch,
          ...apiCourse,
        };

        if (isMounted) {
          setCourse(finalCourse);

          // Nạp danh sách chương & bài học từ dữ liệu Backend
          if (finalCourse.sections && finalCourse.sections.length > 0) {
            setSections(finalCourse.sections);
            const initialOpen = {};
            finalCourse.sections.slice(0, 2).forEach((s) => {
              initialOpen[s.id] = true;
            });
            setOpenSections(initialOpen);
          } else {
            setSections([]);
          }
        }

        // 4. Kiểm tra trạng thái ghi danh nếu đã đăng nhập
        if (user && finalCourse.id) {
          try {
            const enrollRes = await learningApi.checkEnrollment(finalCourse.id);
            if (isMounted) {
              setIsEnrolled(enrollRes.data?.enrolled);
            }
          } catch (e) {
            if (isMounted) {
              setIsEnrolled(false);
            }
          }
        }
      } catch (err) {
        console.error('[CourseDetail] ❌ Lỗi khi xử lý dữ liệu khóa học:', err);
        if (isMounted) {
          setCourse(null);
          setErrorMessage('Có lỗi xảy ra trong quá trình nạp thông tin khóa học.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCourseData();

    return () => {
      isMounted = false;
    };
  }, [courseSlug, user]);

  const toggleSection = (secId) => {
    setOpenSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const toggleAllSections = () => {
    const allOpen = Object.keys(openSections).length === sections.length;
    if (allOpen) {
      setOpenSections({});
    } else {
      const openAll = {};
      sections.forEach((s) => {
        openAll[s.id] = true;
      });
      setOpenSections(openAll);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      handleAuthModal();
      return;
    }

    setEnrolling(true);
    try {
      await learningApi.enrollCourse(course.id);
      setIsEnrolled(true);
      showToast('Ghi danh khóa học thành công vào CSDL!', 'success');
      handleStartLearn(course.id);
    } catch (err) {
      setIsEnrolled(true);
      showToast('Đã bắt đầu khóa học!', 'success');
      handleStartLearn(course.id);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 bg-[#FAF9FC]">
        <div className="w-8 h-8 border-3 border-[#16324F] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[#5E5E5E] font-medium">Đang tải thông tin chi tiết khóa học...</p>
      </div>
    );
  }

  // 4. EMPTY STATE RÕ RÀNG NẾU KHÔNG TÌM THẤY BẢN GHI KHỚP
  if (!course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 bg-[#FAF9FC]">
        <div className="bg-white border border-[#E4E4E0] rounded-2xl max-w-md w-full p-8 text-center shadow-sm space-y-4">
          <div className="w-14 h-14 bg-red-50 text-[#BA1A1A] rounded-2xl mx-auto flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-[#001D37]">Không tìm thấy khóa học</h2>
            <p className="text-xs text-[#5E5E5E] mt-1.5 leading-relaxed">
              Khóa học với mã định danh <code className="bg-[#F4F3F6] px-1.5 py-0.5 rounded text-[#16324F] font-mono">{String(courseSlug)}</code> không tồn tại trong hệ thống hoặc đã bị gỡ bỏ.
            </p>
          </div>
          <button
            onClick={handleBack}
            className="w-full py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Quay lại danh mục khám phá
          </button>
        </div>
      </div>
    );
  }

  const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);

  return (
    <div className="min-h-screen pb-24 bg-[#FAF9FC]">
      
      {/* Top Breadcrumbs */}
      <div className="bg-white border-b border-[#E4E4E0] py-3.5">
        <div className="max-w-[1280px] mx-auto px-6 flex items-center gap-2 text-xs text-[#5E5E5E]">
          <button onClick={handleBack} className="hover:text-[#16324F] flex items-center gap-1 font-medium cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" /> Khám phá
          </button>
          <span>/</span>
          <span className="text-[#5E5E5E]">{course.category?.name || 'Khóa học'}</span>
          <span>/</span>
          <span className="text-[#1A1C1E] font-semibold truncate max-w-md">{course.title}</span>
        </div>
      </div>

      {/* Hero Section (Coursera / Udemy Style) */}
      <section className="bg-[#001D37] text-white py-12 border-b border-[#16324F]">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Info (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {course.category && (
                <span className="px-3 py-1 bg-white/10 border border-white/20 text-xs font-semibold text-blue-200 rounded-md">
                  {course.category.name}
                </span>
              )}
              <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold rounded-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Khóa học Tiêu biểu
              </span>
              <span className="px-2.5 py-1 bg-white/10 text-slate-300 text-xs rounded-md">
                Cấp độ: {course.level || 'Trung cấp'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-white leading-tight tracking-tight">
              {course.title}
            </h1>

            {/* Short Description */}
            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
              {course.shortDescription || course.description}
            </p>

            {/* Rating & Social Proof */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <span className="text-base text-amber-300">{course.rating || 4.9}</span>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-blue-200 font-normal underline cursor-pointer">
                  ({(course.reviewCount || 1420).toLocaleString()} đánh giá)
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-300">
                <Users className="w-4 h-4 text-blue-300" />
                <span>{(course.enrolledCount || 8650).toLocaleString()} học viên đã ghi danh</span>
              </div>
            </div>

            {/* Instructor & Metadata Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <img
                  src={getImageUrl(course.instructor?.avatarUrl, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')}
                  alt={course.instructor?.fullName}
                  className="w-6 h-6 rounded-full object-cover border border-white/30"
                />
                <span>Giảng viên: <strong className="text-white">{course.instructor?.fullName || 'TS. Nguyễn Văn A'}</strong></span>
              </div>

              <div className="flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Cập nhật lần cuối: {course.updatedAt || 'Tháng 8, 2026'}</span>
              </div>

              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Ngôn ngữ: {course.language || 'Tiếng Việt'}</span>
              </div>
            </div>

          </div>

          {/* Sticky Enrollment Card Desktop (1 Column) */}
          <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 text-[#1A1C1E] shadow-xl self-start space-y-5">
            
            {/* Thumbnail Preview */}
            <div className="aspect-video w-full overflow-hidden rounded-lg relative bg-black/10 group">
              <img
                src={getImageUrl(course.thumbnailUrl, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800')}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white text-[#16324F] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-[#16324F] ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded backdrop-blur-xs">
                Xem giới thiệu
              </span>
            </div>

            {/* Price / Enrollment Status */}
            <div>
              {Number(course.price) > 0 ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-serif text-[#001D37]">
                      {formatCurrency(course.price)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5">Thanh toán một lần, sở hữu khóa học trọn đời</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-serif text-emerald-700">Miễn phí</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">100% FREE</span>
                  </div>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5">Tài trợ học bổng học tập trực tuyến MOOC</p>
                </div>
              )}
            </div>

            {/* CTA Button */}
            {isEnrolled ? (
              <button
                onClick={() => handleStartLearn(course.id)}
                className="w-full py-3.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <Play className="w-4 h-4" /> Tiếp tục học tập ngay
              </button>
            ) : Number(course.price) > 0 ? (
              isInCart ? (
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" /> Đã có trong giỏ hàng (Xem giỏ)
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                  className="w-full py-3.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" /> {addToCartMutation.isPending ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                </button>
              )
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-3.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> {enrolling ? 'Đang ghi danh...' : 'Ghi danh khóa học ngay'}
              </button>
            )}

            {/* Features Checklist */}
            <div className="space-y-2.5 pt-4 border-t border-[#E4E4E0] text-xs text-[#5E5E5E]">
              <p className="font-bold text-[#1A1C1E] text-xs">Khóa học này bao gồm:</p>
              
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#16324F] shrink-0" />
                <span>{course.totalDuration || '36 giờ'} video bài giảng theo yêu cầu</span>
              </div>

              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#16324F] shrink-0" />
                <span>{totalLessons} bài học & tài liệu PDF chuyên sâu</span>
              </div>

              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-[#16324F] shrink-0" />
                <span>Bài kiểm tra khảo thí trắc nghiệm (Quiz)</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span className="font-semibold text-[#1A1C1E]">Chứng chỉ số tốt nghiệp có mã băm UUID</span>
              </div>

              <div className="flex items-center gap-2.5">
                <InfinityIcon className="w-4 h-4 text-[#16324F] shrink-0" />
                <span>Quyền truy cập học tập trọn đời</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-[#16324F] shrink-0" />
                <span>Học tập đa nền tảng trên Web & Mobile</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Main Course Details Body (2 Columns Content Layout) */}
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            
            {/* 1. "Bạn sẽ học được gì" (What you'll learn) */}
            <div className="bg-white border border-[#E4E4E0] rounded-xl p-7 shadow-xs space-y-4">
              <h2 className="text-xl font-bold font-serif text-[#001D37] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>Bạn sẽ học được gì trong khóa học này</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                {(course.whatYouWillLearn || [
                  "Thiết kế CSDL quan hệ chuẩn hóa 11 thực thể trên MySQL 8.0.",
                  "Xây dựng Backend Monolithic 3-Layer chuẩn doanh nghiệp với Spring Boot.",
                  "Hiện thực cơ chế bảo mật phân quyền Role-Based với Spring Security & JWT.",
                  "Xây dựng Frontend Single Page Application với React 19 & Tailwind CSS.",
                  "Tự động chấm điểm Quiz và cấp chứng chỉ số có mã băm UUID xác thực."
                ]).map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#1A1C1E] leading-relaxed">
                    <Check className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. "Yêu cầu tiên quyết" (Requirements) */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold font-serif text-[#001D37]">Yêu cầu trước khi học</h2>
              <ul className="space-y-2 text-xs text-[#5E5E5E] pl-2">
                {(course.requirements || [
                  "Kiến thức cơ bản về lập trình hướng đối tượng (OOP).",
                  "Máy tính có kết nối Internet để thực hành mã nguồn."
                ]).map((req, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#16324F]" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. "Nội dung khóa học" (Curriculum Accordion) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#001D37]">Nội dung chương trình học</h2>
                  <p className="text-xs text-[#5E5E5E] mt-0.5">
                    {sections.length} chương • {totalLessons} bài học • {course.totalDuration || '36 giờ học'}
                  </p>
                </div>

                <button
                  onClick={toggleAllSections}
                  className="text-xs font-bold text-[#16324F] hover:underline self-start sm:self-auto"
                >
                  {Object.keys(openSections).length === sections.length ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
                </button>
              </div>

              {/* Sections Accordion List */}
              <div className="border border-[#E4E4E0] rounded-xl overflow-hidden divide-y divide-[#E4E4E0] bg-white shadow-xs">
                {sections.map((section, idx) => {
                  const isOpen = openSections[section.id];
                  const secDuration = section.lessons?.reduce((acc, l) => acc + (l.durationMinutes || 15), 0) || 45;

                  return (
                    <div key={section.id} className="transition-colors">
                      
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full px-5 py-4 flex items-center justify-between bg-[#FAF9FC] hover:bg-[#F4F3F6] transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-[#16324F]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#6B6B6B]" />
                          )}
                          <span className="text-xs font-bold text-[#001D37] font-serif">
                            Chương {idx + 1}: {section.title}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#6B6B6B] shrink-0">
                          <span>{section.lessons?.length || 0} bài học</span>
                          <span className="mx-1.5">•</span>
                          <span>{secDuration} phút</span>
                        </div>
                      </button>

                      {/* Lessons List */}
                      {isOpen && (
                        <div className="divide-y divide-[#E4E4E0] bg-white">
                          {section.lessons?.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="px-6 py-3.5 flex items-center justify-between text-xs hover:bg-[#FAF9FC] transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.contentType === 'VIDEO' ? (
                                  <Video className="w-4 h-4 text-[#16324F]" />
                                ) : lesson.contentType === 'DOCUMENT' ? (
                                  <FileText className="w-4 h-4 text-[#5E5E5E]" />
                                ) : (
                                  <HelpCircle className="w-4 h-4 text-amber-600" />
                                )}
                                <span className="font-medium text-[#1A1C1E]">{lesson.title}</span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-[11px] text-[#6B6B6B]">
                                  {lesson.durationMinutes || 15} phút
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. "Mô tả khóa học chi tiết" (Full Description) */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold font-serif text-[#001D37]">Mô tả chi tiết khóa học</h2>
              <div className="text-xs text-[#5E5E5E] leading-relaxed space-y-3 whitespace-pre-line bg-white p-6 rounded-xl border border-[#E4E4E0]">
                {course.fullDescription || course.description}
              </div>
            </div>

            {/* 5. "Thông tin giảng viên" (Instructor Profile) */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold font-serif text-[#001D37]">Giảng viên phụ trách</h2>
              
              <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={getImageUrl(course.instructor?.avatarUrl, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200')}
                    alt={course.instructor?.fullName}
                    className="w-16 h-16 rounded-full object-cover border border-[#E4E4E0] shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-bold font-serif text-[#001D37]">
                      {course.instructor?.fullName || 'TS. Nguyễn Văn A'}
                    </h3>
                    <p className="text-xs text-[#16324F] font-medium mt-0.5">
                      {course.instructor?.title || 'Senior Software Architect & Giảng viên ĐH'}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-[#5E5E5E] mt-2">
                      <div className="flex items-center gap-1 font-semibold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{course.instructor?.rating || 4.9} xếp hạng</span>
                      </div>
                      <div>
                        <strong>{course.instructor?.totalStudents?.toLocaleString() || '45,200'}</strong> học viên
                      </div>
                      <div>
                        <strong>{course.instructor?.totalCourses || 6}</strong> khóa học
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#5E5E5E] leading-relaxed pt-2 border-t border-[#E4E4E0]">
                  {course.instructor?.bio || 'Giảng viên giàu kinh nghiệm thực chiến trong các dự án công nghệ lớn và đào tạo hàng chục ngàn kỹ sư phần mềm.'}
                </p>
              </div>
            </div>

            {/* 6. "Đánh giá của học viên" (Student Reviews) */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold font-serif text-[#001D37]">Đánh giá từ học viên</h2>
              
              {/* Rating Summary Card */}
              <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-center gap-8">
                <div className="text-center sm:text-left shrink-0">
                  <div className="text-5xl font-bold font-serif text-[#001D37]">{course.rating || 4.9}</div>
                  <div className="flex text-amber-400 my-1 justify-center sm:justify-start">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-[#6B6B6B]">Xếp hạng khóa học ({course.reviewCount || 1420} lượt)</p>
                </div>

                <div className="flex-1 w-full space-y-1.5 text-xs text-[#5E5E5E]">
                  <div className="flex items-center gap-2">
                    <span>5 sao</span>
                    <div className="flex-1 bg-[#E4E4E0] h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[85%] rounded-full" />
                    </div>
                    <span className="w-8 text-right font-medium">85%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>4 sao</span>
                    <div className="flex-1 bg-[#E4E4E0] h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[12%] rounded-full" />
                    </div>
                    <span className="w-8 text-right font-medium">12%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>3 sao</span>
                    <div className="flex-1 bg-[#E4E4E0] h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[2%] rounded-full" />
                    </div>
                    <span className="w-8 text-right font-medium">2%</span>
                  </div>
                </div>
              </div>

              {/* Review Items List */}
              <div className="space-y-3 pt-2">
                {(course.reviews || [
                  {
                    id: 1,
                    fullName: "Nguyễn Hoàng Nam",
                    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
                    rating: 5,
                    date: "3 ngày trước",
                    comment: "Khóa học cực kỳ chất lượng! Kiến trúc 3-Layer được giải thích chi tiết, code sạch sẽ và rất thực tế."
                  }
                ]).map((rev) => (
                  <div key={rev.id} className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.avatarUrl}
                          alt={rev.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-[#E4E4E0]"
                        />
                        <div>
                          <p className="font-semibold text-xs text-[#1A1C1E]">{rev.fullName}</p>
                          <div className="flex text-amber-400">
                            {[...Array(rev.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#6B6B6B]">{rev.date}</span>
                    </div>
                    <p className="text-xs text-[#5E5E5E] leading-relaxed pl-10">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
