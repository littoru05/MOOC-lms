import React, { useState, useEffect } from 'react';
import { courseApi } from '../../api/courseApi';
import { COURSES } from '../../mocks/courses';
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
  Globe
} from 'lucide-react';

export const ExplorePage = ({ onSelectCourse }) => {
  const [courses, setCourses] = useState(COURSES);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

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
        setCourses(SAMPLE_COURSES);
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

  return (
    <div className="min-h-screen pb-20">
      
      {/* Scholarly Hero Banner */}
      <section className="bg-white border-b border-[#E4E4E0] py-14">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F3F6] border border-[#E4E4E0] rounded-full text-xs font-semibold text-[#16324F] mb-4">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Tiêu chuẩn Đào tạo MOOC Quốc tế • Cấp Chứng chỉ số Xác thực UUID</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-[#001D37] tracking-tight leading-tight">
              Khám phá tri thức, làm chủ công nghệ tương lai
            </h1>
            <p className="text-sm md:text-base text-[#5E5E5E] mt-3 leading-relaxed">
              Các khóa học thực chiến từ cơ bản đến nâng cao được biên soạn bởi các chuyên gia hàng đầu. Lộ trình bài bản, bài tập thực hành, khảo thí tự động và cấp chứng nhận số có giá trị toàn cầu.
            </p>

            {/* Search Input Bar */}
            <div className="mt-6 flex items-center bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl px-4 py-2.5 max-w-xl focus-within:border-[#16324F] focus-within:bg-white shadow-xs transition-all">
              <Search className="w-4 h-4 text-[#6B6B6B] mr-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên khóa học, công nghệ, giảng viên..."
                className="w-full text-xs bg-transparent focus:outline-none text-[#1A1C1E] placeholder:text-[#6B6B6B]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Course Catalog */}
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        
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
              <div
                key={course.id}
                onClick={() => onSelectCourse(course.slug || course.id)}
                className="bg-white border border-[#E4E4E0] rounded-xl overflow-hidden hover:border-[#16324F] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail & Level Badge */}
                  <div className="aspect-video w-full overflow-hidden bg-[#EFEDF0] relative">
                    <img
                      src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Level Pill */}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-white/95 backdrop-blur-xs border border-[#E4E4E0] text-[11px] font-bold text-[#16324F] rounded-md shadow-xs">
                      {course.level || 'Chuyên sâu'}
                    </span>

                    {/* Category Tag */}
                    {course.category && (
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 bg-[#001D37]/90 text-white text-[10px] font-semibold rounded-md backdrop-blur-xs">
                        {course.category.name}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2.5">
                    
                    {/* Title */}
                    <h3 className="font-serif text-lg font-bold text-[#001D37] line-clamp-2 group-hover:text-[#16324F] leading-snug">
                      {course.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-[#5E5E5E] line-clamp-2 leading-relaxed">
                      {course.shortDescription || course.description}
                    </p>

                    {/* Instructor Info */}
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={course.instructor?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                        alt={course.instructor?.fullName}
                        className="w-5 h-5 rounded-full object-cover border border-[#E4E4E0]"
                      />
                      <span className="text-xs font-medium text-[#1A1C1E] truncate">
                        {course.instructor?.fullName || 'TS. Nguyễn Văn A'}
                      </span>
                    </div>

                    {/* Rating & Social Metrics */}
                    <div className="flex items-center gap-3 pt-1 text-xs">
                      <div className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{course.rating || 4.9}</span>
                        <span className="text-[#6B6B6B] font-normal text-[11px]">
                          ({(course.reviewCount || 1200).toLocaleString()})
                        </span>
                      </div>
                      <span className="text-[#E4E4E0]">•</span>
                      <div className="flex items-center gap-1 text-[#5E5E5E] text-[11px]">
                        <Users className="w-3 h-3 text-[#16324F]" />
                        <span>{(course.enrolledCount || 4500).toLocaleString()} học viên</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer Specs */}
                <div className="px-5 py-3.5 bg-[#FAF9FC] border-t border-[#E4E4E0] flex items-center justify-between text-[11px] text-[#5E5E5E]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#16324F]" />
                    <span>{course.totalDuration || '30 giờ'}</span>
                    <span>•</span>
                    <span>{course.totalLessons || (course.sections?.reduce((a, s) => a + (s.lessons?.length || 0), 0) || 15)} bài</span>
                  </div>

                  <span className="font-semibold text-[#16324F] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
