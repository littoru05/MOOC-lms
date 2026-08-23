import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseApi } from '../../api/courseApi';
import { COURSES, FEATURED_INSTRUCTORS, POPULAR_CATEGORIES } from '../../mocks/courses';
import { Carousel } from '../../components/common/Carousel';
import { CourseCardWithPreview } from '../../components/course/CourseCardWithPreview';
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
  Layout
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
  const [courses, setCourses] = useState(COURSES);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState(initialFilterQuery || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialFilterQuery) {
      setSearchQuery(initialFilterQuery);
    }
  }, [initialFilterQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, catRes] = await Promise.all([
          courseApi.getPublishedCourses().catch(() => ({ data: [] })),
          courseApi.getCategories().catch(() => ({ data: [] })),
        ]);
        
        // Merge backend courses with rich metadata if available
        if (courseRes.data && courseRes.data.length > 0) {
          const merged = courseRes.data.map((apiCourse) => {
            const richMatch = COURSES.find(
              (sc) => String(sc.slug).toLowerCase() === String(apiCourse.slug).toLowerCase() || String(sc.id) === String(apiCourse.id)
            );
            return richMatch ? { ...richMatch, ...apiCourse } : apiCourse;
          });
          const allCourses = [...merged];
          COURSES.forEach((sc) => {
            if (!allCourses.some((c) => String(c.slug).toLowerCase() === String(sc.slug).toLowerCase() || String(c.id) === String(sc.id))) {
              allCourses.push(sc);
            }
          });
          setCourses(allCourses);
        } else {
          setCourses(COURSES);
        }

        if (catRes.data && catRes.data.length > 0) {
          setCategories(catRes.data);
        } else {
          setCategories([
            { id: 1, name: 'Lập trình Web', slug: 'lap-trinh-web' },
            { id: 2, name: 'Trí tuệ nhân tạo & Data Science', slug: 'ai-data-science' },
            { id: 3, name: 'Lập trình Di động', slug: 'lap-trinh-di-dong' }
          ]);
        }
      } catch (err) {
        console.warn('Dùng dữ liệu chuẩn hóa nội bộ:', err);
        setCourses(COURSES);
      }
    };

    fetchData();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchCat =
      selectedCategory === 'all' ||
      c.category?.slug === selectedCategory ||
      c.category?.name === selectedCategory;
    const matchLevel =
      selectedLevel === 'all' ||
      c.level?.toLowerCase().includes(selectedLevel.toLowerCase());
    const matchSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchLevel && matchSearch;
  });

  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20 space-y-12">
      
      {/* Scholarly Hero Banner - Deep Navy Luxury Gradient & High Contrast */}
      <section className="bg-gradient-to-br from-[#001D37] via-[#16324F] to-[#0A2540] text-white py-16 sm:py-20 relative overflow-hidden border-b border-[#001D37] shadow-md">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1280px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-amber-300 shadow-sm">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Tiêu chuẩn Đào tạo MOOC Quốc tế • Cấp Chứng chỉ số UUID</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold font-serif text-white tracking-tight leading-[1.15]">
                Khám phá tri thức, làm chủ công nghệ tương lai
              </h1>

              <p className="text-[#E0E7F1] text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-normal">
                Các chương trình đào tạo thực chiến từ nền tảng đến kiến trúc doanh nghiệp được biên soạn bởi các chuyên gia đầu ngành. Khảo thí trực tuyến tự động và cấp chứng nhận số có giá trị xác thực toàn cầu.
              </p>

              {/* High-Contrast Search & CTA Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
                <div className="flex-1 flex items-center bg-white rounded-xl px-4 py-3 shadow-lg focus-within:ring-2 focus-within:ring-amber-400 text-[#1A1C1E] transition-all">
                  <Search className="w-4 h-4 text-[#6B6B6B] mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm khóa học, công nghệ (React, Spring Boot, AI)..."
                    className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-[#1A1C1E] placeholder:text-[#8E8E93]"
                  />
                </div>

                <button
                  onClick={() => {
                    const catalogEl = document.getElementById('course-catalog-section');
                    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-[#001D37] font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Khám phá ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Visual Highlight Cards (Desktop Only) */}
            <div className="hidden lg:grid lg:col-span-5 grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl space-y-2 hover:bg-white/15 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <h4 className="text-2xl font-bold font-serif text-white">4.9 / 5.0</h4>
                <p className="text-xs text-[#E0E7F1] leading-relaxed">
                  Đánh giá chất lượng từ hơn 45,000+ học viên trên cả nước.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl space-y-2 hover:bg-white/15 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-300" />
                </div>
                <h4 className="text-2xl font-bold font-serif text-white">100%</h4>
                <p className="text-xs text-[#E0E7F1] leading-relaxed">
                  Giảng viên là Tiến sĩ, Kiến trúc sư trưởng đầu ngành trực tiếp giảng dạy.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl space-y-2 hover:bg-white/15 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </div>
                <h4 className="text-2xl font-bold font-serif text-white">UUID Hash</h4>
                <p className="text-xs text-[#E0E7F1] leading-relaxed">
                  Chứng chỉ số xác thực bằng mã băm toàn cầu chống làm giả.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl space-y-2 hover:bg-white/15 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-300" />
                </div>
                <h4 className="text-2xl font-bold font-serif text-white">Tự động hóa</h4>
                <p className="text-xs text-[#E0E7F1] leading-relaxed">
                  Thi trắc nghiệm trực tuyến chấm điểm và cấp chứng chỉ tức thì.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3 CAROUSEL SECTIONS IN EXACT REQUESTED ORDER */}
      <div className="max-w-[1280px] mx-auto px-6 space-y-14">
        
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
                    src={inst.avatarUrl}
                    alt={inst.fullName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#16324F] shadow-xs mx-auto group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-0 right-0 p-1 bg-[#16324F] text-white rounded-full shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-sm text-[#001D37] group-hover:text-[#16324F] transition-colors">
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
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#001D37]">
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

          {/* Level Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#5E5E5E]">Cấp độ:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-[#E4E4E0] rounded-lg text-[#1A1C1E] focus:outline-none focus:border-[#16324F]"
            >
              <option value="all">Tất cả cấp độ</option>
              <option value="Cơ bản">Cơ bản</option>
              <option value="Trung cấp">Trung cấp</option>
              <option value="Nâng cao">Nâng cao</option>
            </select>
          </div>

        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-[#5E5E5E]">
            Hiển thị <span className="font-bold text-[#1A1C1E]">{filteredCourses.length}</span> khóa học tiêu chuẩn
          </p>
        </div>

        {/* Rich Course Cards Grid (Coursera / Udemy Standard) */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E4E4E0] rounded-xl">
            <BookOpen className="w-12 h-12 text-[#6B6B6B] mx-auto mb-3 opacity-40" />
            <p className="text-base font-bold font-serif text-[#1A1C1E]">Không tìm thấy khóa học phù hợp</p>
            <p className="text-xs text-[#5E5E5E] mt-1">Vui lòng thử lại với từ khóa hoặc bộ lọc danh mục khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredCourses.map((course) => (
              <CourseCardWithPreview
                key={course.id}
                course={course}
                onSelectCourse={onSelectCourse || ((slug) => navigate(`/courses/${slug}`))}
              />
            ))}
          </div>
        )}

        </div>
      </div>
    </div>
  );
};
