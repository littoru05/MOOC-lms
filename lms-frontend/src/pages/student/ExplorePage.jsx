import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublishedCourses, useCategories, useMyEnrollments } from '../../hooks/useCourses';
import { useAuth } from '../../context/AuthContext';
import { FEATURED_INSTRUCTORS } from '../../data/featuredInstructors';
import { Carousel } from '../../components/common/Carousel';
import { CourseCardWithPreview } from '../../components/course/CourseCardWithPreview';
import { Pagination } from '../../components/common/Pagination';
import { getImageUrl } from '../../utils/imageUrl';
import { 
  Search, 
  BookOpen, 
  Clock, 
  Award, 
  ArrowRight, 
  Star, 
  Users, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  Globe, 
  GraduationCap, 
  Smartphone, 
  Cpu, 
  BarChart3, 
  Cloud, 
  ShieldCheck, 
  Database, 
  Layout,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Flame
} from 'lucide-react';

const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case 'Globe': return <Globe className="w-5 h-5 text-blue-600" />;
    case 'Smartphone': return <Smartphone className="w-5 h-5 text-emerald-600" />;
    case 'Cpu': return <Cpu className="w-5 h-5 text-purple-600" />;
    case 'BarChart3': return <BarChart3 className="w-5 h-5 text-amber-600" />;
    case 'Cloud': return <Cloud className="w-5 h-5 text-sky-600" />;
    case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-rose-600" />;
    case 'Database': return <Database className="w-5 h-5 text-indigo-600" />;
    case 'Layout': return <Layout className="w-5 h-5 text-pink-600" />;
    default: return <BookOpen className="w-5 h-5 text-[#16324F]" />;
  }
};

export const ExplorePage = ({ onSelectCourse, initialFilterQuery = '' }) => {
  const { user } = useAuth();
  const { data: courses = [], isLoading: loadingCourses } = usePublishedCourses();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { data: myEnrollments = [] } = useMyEnrollments(Boolean(user));

  const enrolledCourseIds = useMemo(() => {
    const set = new Set();
    myEnrollments.forEach((e) => {
      const cid = e.courseId ?? e.course?.id;
      if (cid != null) {
        set.add(Number(cid));
        set.add(String(cid));
      }
    });
    return set;
  }, [myEnrollments]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState(initialFilterQuery || '');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    if (initialFilterQuery) {
      setSearchQuery(initialFilterQuery);
    }
  }, [initialFilterQuery]);

  // Reset ve trang 1 khi thay doi danh muc hoac tu khoa tim kiem
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const selectedCat = categories?.find(
        (cat) =>
          cat.slug?.toLowerCase() === selectedCategory.toLowerCase() ||
          String(cat.id) === selectedCategory ||
          cat.name?.toLowerCase() === selectedCategory.toLowerCase()
      );

      const matchCat =
        selectedCategory === 'all' ||
        (c.categorySlug && c.categorySlug.toLowerCase() === selectedCategory.toLowerCase()) ||
        (selectedCat && c.categoryId === selectedCat.id) ||
        (c.categoryName && c.categoryName.toLowerCase() === selectedCategory.toLowerCase()) ||
        (c.category && (c.category.slug?.toLowerCase() === selectedCategory.toLowerCase() || c.category.name?.toLowerCase() === selectedCategory.toLowerCase()));

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchCat;

      const matchSearch =
        c.title.toLowerCase().includes(q) ||
        c.shortDescription?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        (c.instructorName && c.instructorName.toLowerCase().includes(q)) ||
        (c.instructor?.fullName && c.instructor.fullName.toLowerCase().includes(q)) ||
        (c.categoryName && c.categoryName.toLowerCase().includes(q)) ||
        (c.categorySlug && c.categorySlug.toLowerCase().includes(q)) ||
        (c.category?.name && c.category.name.toLowerCase().includes(q)) ||
        (c.category?.slug && c.category.slug.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [courses, categories, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredCourses.length / PAGE_SIZE) || 1;

  // Dam bao currentPage luon nam trong gioi han hop le
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredCourses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCourses, currentPage, PAGE_SIZE]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const catalogEl = document.getElementById('course-catalog-section');
    if (catalogEl && typeof catalogEl.scrollIntoView === 'function') {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigate = useNavigate();

  // Top Featured Courses Showcase on Hero Banner (up to 3 courses with auto-advance)
  const [featuredHeroIndex, setFeaturedHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  const featuredCourses = useMemo(() => {
    return courses && courses.length > 0 ? courses.slice(0, 3) : [];
  }, [courses]);

  const currentFeatured = featuredCourses[featuredHeroIndex] || courses[0] || null;

  useEffect(() => {
    if (isHeroPaused || featuredCourses.length <= 1) return;
    const timer = setInterval(() => {
      setFeaturedHeroIndex((prev) => (prev + 1) % featuredCourses.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHeroPaused, featuredCourses.length]);

  const bannerCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.slice(0, 6);
    }
    return [
      { id: 1, name: 'Lập trình Web', slug: 'lap-trinh-web' },
      { id: 2, name: 'Trí tuệ nhân tạo', slug: 'ai-data-science' },
      { id: 3, name: 'Lập trình Di động', slug: 'lap-trinh-di-dong' },
      { id: 4, name: 'DevOps & Cloud', slug: 'devops-cloud' },
      { id: 5, name: 'Thiết kế UI/UX', slug: 'thiet-ke-ui-ux' },
      { id: 6, name: 'An ninh mạng', slug: 'an-ninh-mang' },
    ];
  }, [categories]);

  return (
    <div className="min-h-screen pb-20 space-y-12">
      
      {/* Scholarly Hero Banner - Deep Navy Luxury Gradient & High Contrast */}
      <section className="bg-gradient-to-br from-[#001428] via-[#0A2540] to-[#001D37] text-white py-14 sm:py-18 relative overflow-hidden border-b border-[#001D37] shadow-md">
        {/* Geometric dot texture overlay & ambient glow */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute top-0 left-10 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1280px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5">
              {/* Live Status Pill with Pulsing Glow */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-white/[0.08] backdrop-blur-md border border-amber-400/30 rounded-full text-xs font-semibold text-amber-300 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>1,450+ học viên đang học trực tuyến • Cấp Chứng chỉ số UUID</span>
              </div>

              {/* High-Impact Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-white leading-snug">
                Khám phá tri thức, làm chủ công nghệ tương lai
              </h1>

              {/* Sub-headline */}
              <p className="text-[#D0DCED] text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                Học tập theo lộ trình thực chiến từ chuyên gia đầu ngành. Khảo thí trắc nghiệm tự động, tương tác bài giảng thực tiễn và cấp chứng chỉ số có giá trị xác thực toàn cầu.
              </p>

              {/* Search & Explore Action Bar */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
                <div className="flex-1 flex items-center bg-white rounded-xl px-4 py-3 shadow-lg focus-within:ring-2 focus-within:ring-amber-400 text-[#1A1C1E] transition-all">
                  <Search className="w-4 h-4 text-[#6B6B6B] mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedCategory !== 'all') {
                        setSelectedCategory('all');
                      }
                    }}
                    placeholder="Tìm khóa học, danh mục (React, Spring Boot, AI)..."
                    className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-[#1A1C1E] placeholder:text-[#8E8E93]"
                  />
                </div>

                <button
                  onClick={() => {
                    const catalogEl = document.getElementById('course-catalog-section');
                    if (catalogEl && typeof catalogEl.scrollIntoView === 'function') {
                      catalogEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#001D37] font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Khám phá ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Category Filter Chips (Directly Filters by Category) */}
              <div className="flex items-center gap-2 flex-wrap pt-0.5 text-xs">
                <span className="text-amber-300 font-semibold flex items-center gap-1 shrink-0">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Danh mục nổi bật:
                </span>
                {bannerCategories.map((cat) => {
                  const isSelected = selectedCategory.toLowerCase() === (cat.slug || cat.name || '').toLowerCase();
                  return (
                    <button
                      key={cat.id || cat.slug || cat.name}
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        const newCat = isSelected ? 'all' : (cat.slug || cat.name);
                        setSelectedCategory(newCat);
                        const catalogEl = document.getElementById('course-catalog-section');
                        if (catalogEl && typeof catalogEl.scrollIntoView === 'function') {
                          catalogEl.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className={`px-3 py-1 rounded-lg border transition-all text-xs font-medium cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-[#001D37] border-amber-400 font-bold shadow-md scale-105'
                          : 'bg-white/10 hover:bg-white/20 border-white/20 text-white hover:border-amber-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Community Social Proof & Trust Badges */}
              <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-center gap-4 text-xs max-w-xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    <img className="w-7 h-7 rounded-full border-2 border-[#0A2540] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64" alt="Learner" />
                    <img className="w-7 h-7 rounded-full border-2 border-[#0A2540] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64" alt="Learner" />
                    <img className="w-7 h-7 rounded-full border-2 border-[#0A2540] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64" alt="Learner" />
                    <div className="w-7 h-7 rounded-full border-2 border-[#0A2540] bg-amber-500 text-[#001D37] font-bold text-[10px] flex items-center justify-center">
                      +45k
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-300 font-bold text-[11px]">
                      <span>★ 4.9 / 5.0</span>
                      <span className="text-white/60 font-normal text-[10px]">(12,400+ đánh giá)</span>
                    </div>
                    <span className="text-[10px] text-white/70">Cộng đồng học viên MOOC năng động</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:ml-auto text-[11px] text-white/80">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Chuẩn quốc tế
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Xác thực UUID
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Showcase Column - High-End Interactive Featured Course Card & Ambient Badges */}
            <div className="lg:col-span-5 w-full">
              <div 
                onMouseEnter={() => setIsHeroPaused(true)}
                onMouseLeave={() => setIsHeroPaused(false)}
                className="relative"
              >
                {/* Floating Badge 1 - Top Right (UUID Verification Trust) */}
                <div className="absolute -top-4 -right-2 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#001D37]/90 border border-amber-400/30 backdrop-blur-md shadow-xl animate-float-slow">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">Chứng chỉ số UUID</span>
                    <span className="text-[11px] text-white/90 font-medium">Bảo chứng toàn cầu</span>
                  </div>
                </div>

                {/* Floating Badge 2 - Bottom Left (Completion & Satisfaction Rate) */}
                <div className="absolute -bottom-4 -left-3 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#001D37]/90 border border-emerald-400/30 backdrop-blur-md shadow-xl animate-float-reverse">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">98.5% Hoàn thành</span>
                    <span className="text-[11px] text-white/90 font-medium">Đạt chuẩn doanh nghiệp</span>
                  </div>
                </div>

                {/* Main Featured Showcase Card */}
                <div className="bg-white/[0.08] backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl overflow-hidden group hover:border-white/30 transition-all">
                  {/* Course Media Thumbnail with Visual Overlay */}
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#0A2540] border border-white/10 shadow-inner">
                    <img
                      src={getImageUrl(
                        currentFeatured?.thumbnailUrl,
                        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'
                      )}
                      alt={currentFeatured?.title || 'Khóa học tiêu biểu'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#001428] via-[#001428]/40 to-transparent"></div>

                    {/* Top Floating Category & Status Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#001D37]/85 backdrop-blur-md text-amber-300 border border-amber-400/30 rounded-full text-[11px] font-bold shadow-md">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>{currentFeatured?.categoryName || 'Khóa học tiêu biểu'}</span>
                      </span>
                      <span className="px-2.5 py-1 bg-emerald-500/90 text-white rounded-full text-[10px] font-bold shadow-md">
                        Đang mở ghi danh
                      </span>
                    </div>

                    {/* Center Interactive Play / Explore Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (currentFeatured?.slug || currentFeatured?.id) {
                          navigate(`/courses/${currentFeatured.slug || currentFeatured.id}`);
                        }
                      }}
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/90 hover:bg-amber-400 text-[#001D37] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      aria-label="Xem chi tiết khóa học"
                    >
                      <BookOpen className="w-5 h-5 ml-0.5" />
                    </button>

                    {/* Bottom Overlay Info on Thumbnail */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
                      <span className="flex items-center gap-1 text-amber-300 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> 4.9/5.0
                      </span>
                      <span className="flex items-center gap-1 text-white/80">
                        <Users className="w-3.5 h-3.5 text-cyan-300" /> {currentFeatured?.enrolledCount || '3,850'}+ học viên
                      </span>
                      <span className="flex items-center gap-1 text-white/80">
                        <Clock className="w-3.5 h-3.5 text-cyan-300" /> {currentFeatured?.totalDurationMinutes ? `${Math.round(currentFeatured.totalDurationMinutes / 60)} giờ` : '32 giờ'}
                      </span>
                    </div>
                  </div>

                  {/* Course Details & Action Section */}
                  <div className="pt-4 space-y-3">
                    <div>
                      <h3 
                        onClick={() => {
                          if (currentFeatured?.slug || currentFeatured?.id) {
                            navigate(`/courses/${currentFeatured.slug || currentFeatured.id}`);
                          }
                        }}
                        className="text-base sm:text-lg font-bold text-white hover:text-amber-300 transition-colors line-clamp-2 cursor-pointer"
                      >
                        {currentFeatured?.title || 'Lập trình Fullstack Web hiện đại với React và Spring Boot'}
                      </h3>
                      <p className="text-xs text-[#CBD5E1] mt-1 line-clamp-1">
                        {currentFeatured?.instructorName ? `Giảng viên: ${currentFeatured.instructorName}` : 'TS. Nguyễn Văn A • Kiến trúc sư trưởng'}
                      </p>
                    </div>

                    {/* Footer Bar with Price & CTA */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#A6C8FF] block">Học phí</span>
                        <span className="text-sm font-bold text-amber-300">
                          {currentFeatured?.price ? `${currentFeatured.price.toLocaleString('vi-VN')} đ` : 'Miễn phí học thử'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (currentFeatured?.slug || currentFeatured?.id) {
                            navigate(`/courses/${currentFeatured.slug || currentFeatured.id}`);
                          } else {
                            navigate('/courses');
                          }
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#001D37] font-bold text-xs rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Khám phá khóa học</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Featured Courses Switcher Dots */}
                  {featuredCourses.length > 1 && (
                    <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-[#A6C8FF]">Khóa học nổi bật ({featuredHeroIndex + 1}/{featuredCourses.length})</span>
                      <div className="flex items-center gap-1.5">
                        {featuredCourses.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFeaturedHeroIndex(idx)}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              featuredHeroIndex === idx
                                ? 'w-6 bg-amber-400'
                                : 'w-2 bg-white/30 hover:bg-white/60'
                            }`}
                            aria-label={`Xem khóa học ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3 CAROUSEL SECTIONS IN EXACT REQUESTED ORDER */}
      <div className="max-w-[1280px] mx-auto px-6 space-y-14">
        
        {/* CATEGORY SHOWCASE SECTION */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFEDF0] border border-[#E4E4E0] rounded-full text-[11px] font-bold text-[#16324F] mb-2">
                <Layers className="w-3.5 h-3.5 text-[#16324F]" />
                <span>Lĩnh vực đào tạo</span>
              </div>
              <h2 className="text-2xl font-bold  text-[#001D37]">
                Khám phá theo danh mục chuyên môn
              </h2>
              <p className="text-xs text-[#5E5E5E] mt-1">
                Lựa chọn lĩnh vực chuyên sâu để tiếp cận lộ trình đào tạo bài bản từ chuyên gia
              </p>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="text-xs font-bold text-[#16324F] hover:text-[#001D37] flex items-center gap-1 hover:underline cursor-pointer self-start sm:self-auto"
            >
              <span>Xem tất cả ({categories.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id || cat.slug}
                onClick={() => navigate(`/courses?category=${cat.slug}`)}
                className="bg-white border border-[#E4E4E0] rounded-2xl p-4.5 hover:border-[#16324F] hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F3F6] border border-[#E4E4E0] flex items-center justify-center group-hover:bg-[#16324F]/10 group-hover:scale-105 transition-all">
                    {getCategoryIcon(cat.icon || 'BookOpen')}
                  </div>
  <ChevronRight className="w-4 h-4 text-[#8C8C8C] group-hover:text-[#16324F] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="mt-3">
                  <h3 className="text-xs sm:text-sm font-bold text-[#001D37] group-hover:text-[#16324F] transition-colors truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#5E5E5E] mt-0.5 line-clamp-1">
                    {cat.description || 'Lộ trình kiến thức chuyên sâu'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CAROUSEL 1: Khóa học nổi bật */}
        <Carousel
          badge="Khuyên học"
          icon={<Sparkles className="w-5 h-5 text-amber-500" />}
          title="Khóa học nổi bật"
          subtitle="Các chương trình đào tạo chuẩn quốc tế được học viên đăng ký nhiều nhất trong tháng"
          items={courses}
          itemClassName="w-[280px] sm:w-[320px] md:w-[330px] shrink-0 snap-start"
          renderItem={(course) => (
            <CourseCardWithPreview
              course={course}
              isEnrolled={enrolledCourseIds.has(course.id)}
              onSelectCourse={onSelectCourse}
            />
          )}
        />

        {/* CAROUSEL 2: Giảng viên nổi bật */}
        <Carousel
          badge="Đội ngũ chuyên gia"
          icon={<GraduationCap className="w-5 h-5 text-[#16324F]" />}
          title="Giảng viên nổi bật"
          subtitle="Đội ngũ giảng viên, tiến sĩ và chuyên gia đầu ngành trực tiếp xây dựng giáo trình"
          items={FEATURED_INSTRUCTORS}
          itemClassName="w-[260px] sm:w-[290px] md:w-[300px] shrink-0 snap-start"
          renderItem={(inst) => (
            <div className="bg-white border border-[#E4E4E0] rounded-2xl p-5 hover:border-[#16324F] hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group text-center space-y-4">
              <div className="space-y-3">
                <div className="relative inline-block mx-auto">
                  <img
                    src={getImageUrl(inst.avatarUrl, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200')}
                    alt={inst.fullName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#16324F] shadow-xs mx-auto group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-0 right-0 p-1 bg-[#16324F] text-white rounded-full shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                </div>

                <div>
                  <h4 className=" font-bold text-sm text-[#001D37] group-hover:text-[#16324F] transition-colors">
                    {inst.fullName}
                  </h4>
                  <p className="text-[11px] font-semibold text-[#16324F] mt-0.5 line-clamp-1">{inst.title}</p>
                  <p className="text-[10px] text-[#5E5E5E] mt-0.5 line-clamp-1">{inst.teachingField}</p>
                </div>

                <p className="text-[11px] text-[#5E5E5E] line-clamp-2 leading-relaxed bg-[#FAF9FC] p-2.5 rounded-xl border border-[#E4E4E0]">
                  {inst.bio}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E4E4E0] flex items-center justify-between text-[11px] text-[#5E5E5E]">
                <div className="flex items-center gap-1 font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{inst.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <BookOpen className="w-3 h-3 text-[#16324F]" />
                  <span>{inst.totalCourses} Khóa học</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <Users className="w-3 h-3 text-[#16324F]" />
                  <span>{(inst.totalStudents).toLocaleString()} HV</span>
                </div>
              </div>
            </div>
          )}
        />



      </div>

      {/* Main Full Course Catalog with Filters & Grid */}
      <div id="course-catalog-section" className="max-w-[1280px] mx-auto px-6 pt-6">
        <div className="border-t border-[#E4E4E0] pt-8">
          <div className="space-y-1 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold  text-[#001D37]">
              Tất cả chương trình đào tạo
            </h2>
            <p className="text-xs text-[#5E5E5E]">
              Tìm kiếm và lọc theo danh mục chuyên môn và cấp độ phù hợp với mục tiêu của bạn
            </p>
          </div>

          {/* Category Pills & Level Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E4E4E0] mb-8">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-[#16324F] text-white shadow-xs'
                  : 'bg-white border border-[#E4E4E0] text-[#5E5E5E] hover:bg-[#FAF9FC]'
              }`}
            >
              Tất cả danh mục ({courses.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                onClick={() => setSelectedCategory(cat.slug || cat.name)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  selectedCategory === (cat.slug || cat.name)
                    ? 'bg-[#16324F] text-white shadow-xs'
                    : 'bg-white border border-[#E4E4E0] text-[#5E5E5E] hover:bg-[#FAF9FC]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-[#5E5E5E]">
            Hiển thị{' '}
            <span className="font-bold text-[#1A1C1E]">
              {filteredCourses.length === 0
                ? 0
                : `${(currentPage - 1) * PAGE_SIZE + 1} - ${Math.min(currentPage * PAGE_SIZE, filteredCourses.length)}`}
            </span>{' '}
            trong tổng số <span className="font-bold text-[#1A1C1E]">{filteredCourses.length}</span> khóa học tiêu chuẩn
            {totalPages > 1 && (
              <span className="ml-2 px-2 py-0.5 bg-[#FAF9FC] border border-[#E4E4E0] rounded-md text-[11px] font-semibold text-[#16324F]">
                Trang {currentPage}/{totalPages}
              </span>
            )}
          </p>
        </div>

        {/* Rich Course Cards Grid (Coursera / Udemy Standard) */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E4E4E0] rounded-xl">
            <BookOpen className="w-12 h-12 text-[#6B6B6B] mx-auto mb-3 opacity-40" />
            <p className="text-base font-bold  text-[#1A1C1E]">Không tìm thấy khóa học phù hợp</p>
            <p className="text-xs text-[#5E5E5E] mt-1">Vui lòng thử lại với từ khóa hoặc bộ lọc danh mục khác.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {paginatedCourses.map((course) => (
                <CourseCardWithPreview
                  key={course.id}
                  course={course}
                  isEnrolled={enrolledCourseIds.has(course.id)}
                  onSelectCourse={onSelectCourse || ((slug) => navigate(`/courses/${slug}`))}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredCourses.length}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
                className="rounded-2xl border border-[#E4E4E0] shadow-xs overflow-hidden"
              />
            )}
          </div>
        )}

        </div>
      </div>
    </div>
  );
};
