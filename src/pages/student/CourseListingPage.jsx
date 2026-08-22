import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  SlidersHorizontal, 
  Star, 
  Clock, 
  RotateCcw, 
  BookOpen, 
  Award,
  Sparkles,
  CheckCircle2,
  X,
  ChevronDown,
  Layers,
  GraduationCap,
  Tag
} from 'lucide-react';
import { CourseCardWithPreview } from '../../components/course/CourseCardWithPreview';
import { COURSES } from '../../mocks/courses';
import { findCategoryHierarchyBySlug } from '../../data/categoryMenu';

export const CourseListingPage = ({ 
  filterQuery = '', 
  onSelectCourse, 
  onNavigate 
}) => {
  // Parsing Category Info from Filter Query
  const categoryInfo = useMemo(() => {
    return findCategoryHierarchyBySlug(filterQuery) || {
      level: 1,
      type: 'all',
      slug: 'all',
      title: 'Tất cả chương trình đào tạo',
      breadcrumbs: [
        { name: 'Trang chủ', slug: 'home' },
        { name: 'Tất cả khóa học', slug: 'all' }
      ]
    };
  }, [filterQuery]);

  // Filter States
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating' | 'students' | 'newest'
  const [searchKeywords, setSearchKeywords] = useState('');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Reset filters when filterQuery changes
  useEffect(() => {
    setSelectedLevels([]);
    setMinRating(0);
    setSelectedDurations([]);
    setSearchKeywords('');
  }, [filterQuery]);

  // Filter & Search Logic
  const filteredCourses = useMemo(() => {
    const q = (filterQuery || '').toLowerCase().trim();

    return COURSES.filter((course) => {
      // 1. Hierarchy Category / Tag matching
      let matchesCategory = true;
      if (q && q !== 'all') {
        const catSlug = course.category?.slug?.toLowerCase();
        const catName = course.category?.name?.toLowerCase();
        const subSlug = course.subcategory?.slug?.toLowerCase();
        const subName = course.subcategory?.name?.toLowerCase();
        const tags = (course.tags || []).map(t => t.toLowerCase());

        matchesCategory = 
          catSlug === q || 
          catName === q || 
          subSlug === q || 
          subName === q || 
          tags.some(t => t.includes(q) || q.includes(t)) ||
          course.title.toLowerCase().includes(q);
      }

      // 2. Level Filter
      let matchesLevel = true;
      if (selectedLevels.length > 0) {
        matchesLevel = selectedLevels.some(lvl => 
          course.level?.toLowerCase().includes(lvl.toLowerCase())
        );
      }

      // 3. Rating Filter
      let matchesRating = true;
      if (minRating > 0) {
        matchesRating = (course.rating || 0) >= minRating;
      }

      // 4. Duration Filter
      let matchesDuration = true;
      if (selectedDurations.length > 0) {
        const hoursMatch = parseInt(course.totalDuration, 10) || 20;
        matchesDuration = selectedDurations.some(range => {
          if (range === 'under10') return hoursMatch < 10;
          if (range === '10to30') return hoursMatch >= 10 && hoursMatch <= 30;
          if (range === 'over30') return hoursMatch > 30;
          return true;
        });
      }

      // 5. Keyword search filter
      let matchesKeywords = true;
      if (searchKeywords.trim()) {
        const kw = searchKeywords.toLowerCase().trim();
        matchesKeywords = 
          course.title.toLowerCase().includes(kw) ||
          course.shortDescription?.toLowerCase().includes(kw) ||
          course.instructor?.fullName?.toLowerCase().includes(kw) ||
          (course.tags && course.tags.some(t => t.toLowerCase().includes(kw)));
      }

      return matchesCategory && matchesLevel && matchesRating && matchesDuration && matchesKeywords;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'students') return (b.enrolledCount || b.students || 0) - (a.enrolledCount || a.students || 0);
      if (sortBy === 'newest') return b.id - a.id;
      // Default: Popular
      return ((b.enrolledCount || 0) * (b.rating || 4.5)) - ((a.enrolledCount || 0) * (a.rating || 4.5));
    });
  }, [filterQuery, selectedLevels, minRating, selectedDurations, searchKeywords, sortBy]);

  const handleResetFilters = () => {
    setSelectedLevels([]);
    setMinRating(0);
    setSelectedDurations([]);
    setSearchKeywords('');
  };

  const hasActiveFilters = selectedLevels.length > 0 || minRating > 0 || selectedDurations.length > 0 || searchKeywords !== '';

  const toggleLevel = (lvl) => {
    setSelectedLevels(prev => 
      prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]
    );
  };

  const toggleDuration = (dur) => {
    setSelectedDurations(prev => 
      prev.includes(dur) ? prev.filter(d => d !== dur) : [...prev, dur]
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] pb-24 text-[#1A1C1E]">
      
      {/* 1. TOP BREADCRUMB & RICH DEEP NAVY HEADER BANNER */}
      <section className="bg-gradient-to-br from-[#001D37] via-[#16324F] to-[#0A2540] text-white py-12 relative overflow-hidden shadow-lg border-b border-[#001D37] animate-banner-entry">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1280px] mx-auto px-6 relative z-10 space-y-5">
          
          {/* Breadcrumb Trail with High Contrast */}
          <nav className="flex items-center gap-2 text-xs text-blue-200/80 flex-wrap font-medium">
            {categoryInfo.breadcrumbs?.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-blue-300/50 shrink-0" />}
                {idx === categoryInfo.breadcrumbs.length - 1 ? (
                  <span className="font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-2xs">
                    {crumb.name}
                  </span>
                ) : (
                  <button 
                    onClick={() => {
                      if (crumb.slug === 'home') onNavigate('student-explore');
                      else onNavigate('student-explore', crumb.slug);
                    }}
                    className="hover:text-white hover:underline cursor-pointer transition-colors"
                  >
                    {crumb.name}
                  </button>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Title & Search Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-amber-300 shadow-sm">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Chuyên mục đào tạo tiêu chuẩn Quốc tế</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold font-serif text-white tracking-tight leading-tight">
                {categoryInfo.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#E0E7F1] leading-relaxed">
                Khám phá các khóa học thực chiến từ các giảng viên đầu ngành. Tìm thấy <strong className="text-amber-400 font-extrabold">{filteredCourses.length}</strong> chương trình đào tạo chất lượng cao.
              </p>
            </div>

            {/* Keyword Search in Category */}
            <div className="flex items-center bg-white rounded-xl px-4 py-2.5 w-full lg:w-88 shadow-xl focus-within:ring-2 focus-within:ring-amber-400 text-[#1A1C1E] transition-all shrink-0">
              <Search className="w-4 h-4 text-[#8E8E93] mr-2.5 shrink-0" />
              <input
                type="text"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                placeholder="Lọc nhanh khóa học trong mục này..."
                className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-[#1A1C1E] placeholder:text-[#8E8E93]"
              />
              {searchKeywords && (
                <button onClick={() => setSearchKeywords('')} className="p-0.5 text-[#8E8E93] hover:text-[#1A1C1E] cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 2. MAIN LAYOUT: SIDEBAR FILTERS + COURSE GRID */}
      <div className="max-w-[1280px] mx-auto px-6 pt-10">
        
        {/* Mobile Filter Trigger Button */}
        <div className="lg:hidden mb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setIsSidebarOpenMobile(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E4E4E0] rounded-xl text-xs font-bold text-[#16324F] shadow-sm cursor-pointer active:scale-95"
          >
            <Filter className="w-4 h-4 text-[#16324F]" />
            <span>Bộ lọc nâng cao {hasActiveFilters && `(${selectedLevels.length + (minRating > 0 ? 1 : 0) + selectedDurations.length})`}</span>
          </button>

          {/* Sort Dropdown Mobile */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5E5E5E]">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#E4E4E0] rounded-xl px-3 py-2 text-xs font-bold text-[#16324F] focus:outline-none focus:border-[#16324F]"
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="students">Học viên nhiều nhất</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR FILTERS */}
          <aside className={`
            lg:col-span-3 bg-white border border-[#E4E4E0] rounded-2xl p-5 space-y-6 shadow-sm
            ${isSidebarOpenMobile ? 'fixed inset-y-0 left-0 z-50 w-80 shadow-2xl overflow-y-auto block' : 'hidden lg:block'}
          `}>
            {/* Header Sidebar */}
            <div className="flex items-center justify-between border-b border-[#E4E4E0] pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#16324F]" />
                <h3 className="font-serif font-extrabold text-sm text-[#001D37]">Bộ lọc nâng cao</h3>
              </div>
              
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Xóa lọc</span>
                  </button>
                )}
                {isSidebarOpenMobile && (
                  <button 
                    onClick={() => setIsSidebarOpenMobile(false)}
                    className="p-1 text-[#5E5E5E] hover:text-[#1A1C1E] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Group 1: Level (Cấp độ) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-[#001D37] uppercase tracking-wider">
                  Cấp độ khóa học
                </h4>
                {selectedLevels.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                )}
              </div>
              <div className="space-y-1">
                {['Cơ bản', 'Trung cấp', 'Nâng cao'].map((lvl) => {
                  const isChecked = selectedLevels.includes(lvl);
                  return (
                    <label 
                      key={lvl}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer select-none transition-all ${
                        isChecked ? 'bg-[#F4F3F6] text-[#16324F] font-bold' : 'text-[#1A1C1E] hover:bg-[#FAF9FC]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleLevel(lvl)}
                        className="w-4 h-4 rounded border-[#E4E4E0] text-[#16324F] focus:ring-[#16324F] accent-[#16324F] cursor-pointer"
                      />
                      <span>{lvl}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Filter Group 2: Rating (Đánh giá) */}
            <div className="space-y-3 pt-4 border-t border-[#E4E4E0]">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-[#001D37] uppercase tracking-wider">
                  Đánh giá chất lượng
                </h4>
                {minRating > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                )}
              </div>
              <div className="space-y-1">
                {[
                  { label: 'Từ 4.8 sao trở lên', value: 4.8 },
                  { label: 'Từ 4.5 sao trở lên', value: 4.5 },
                  { label: 'Từ 4.0 sao trở lên', value: 4.0 },
                  { label: 'Tất cả đánh giá', value: 0 }
                ].map((item) => {
                  const isChecked = minRating === item.value;
                  return (
                    <label 
                      key={item.value}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer select-none transition-all ${
                        isChecked ? 'bg-[#F4F3F6] text-[#16324F] font-bold' : 'text-[#1A1C1E] hover:bg-[#FAF9FC]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rating-filter"
                        checked={isChecked}
                        onChange={() => setMinRating(item.value)}
                        className="w-4 h-4 text-[#16324F] focus:ring-[#16324F] accent-[#16324F] cursor-pointer"
                      />
                      <div className="flex items-center gap-1.5">
                        {item.value > 0 && <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />}
                        <span>{item.label}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Filter Group 3: Duration (Thời lượng) */}
            <div className="space-y-3 pt-4 border-t border-[#E4E4E0]">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-[#001D37] uppercase tracking-wider">
                  Thời lượng chương trình
                </h4>
                {selectedDurations.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                )}
              </div>
              <div className="space-y-1">
                {[
                  { id: 'under10', label: 'Dưới 10 giờ học' },
                  { id: '10to30', label: '10 - 30 giờ học' },
                  { id: 'over30', label: 'Trên 30 giờ chuyên sâu' }
                ].map((dur) => {
                  const isChecked = selectedDurations.includes(dur.id);
                  return (
                    <label 
                      key={dur.id}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer select-none transition-all ${
                        isChecked ? 'bg-[#F4F3F6] text-[#16324F] font-bold' : 'text-[#1A1C1E] hover:bg-[#FAF9FC]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDuration(dur.id)}
                        className="w-4 h-4 rounded border-[#E4E4E0] text-[#16324F] focus:ring-[#16324F] accent-[#16324F] cursor-pointer"
                      />
                      <span>{dur.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-[#E4E4E0]">
              <button
                onClick={handleResetFilters}
                className="w-full py-2.5 px-3 bg-[#FAF9FC] hover:bg-[#F4F3F6] text-[#16324F] border border-[#E4E4E0] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa tất cả bộ lọc</span>
              </button>
            </div>

          </aside>

          {/* RIGHT RESULTS COLUMN */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Desktop Top Results Toolbar */}
            <div className="hidden lg:flex items-center justify-between bg-white border border-[#E4E4E0] rounded-2xl px-5 py-3.5 shadow-sm">
              <div className="flex items-center gap-2.5 text-xs text-[#5E5E5E]">
                <span>Hiển thị <strong className="text-[#001D37] font-bold text-sm">{filteredCourses.length}</strong> kết quả</span>
                {hasActiveFilters && (
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Đang lọc dữ liệu</span>
                  </span>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-[#5E5E5E]">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl px-3.5 py-2 text-xs font-bold text-[#16324F] hover:border-[#16324F] focus:outline-none focus:border-[#16324F] cursor-pointer shadow-2xs transition-colors"
                >
                  <option value="popular">Phổ biến nhất</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="students">Học viên nhiều nhất</option>
                  <option value="newest">Mới cập nhật</option>
                </select>
              </div>
            </div>

            {/* Active Filter Badges */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-[#5E5E5E]">Đang lọc:</span>
                {selectedLevels.map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => toggleLevel(lvl)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E4E4E0] hover:border-rose-300 text-xs font-semibold text-[#16324F] rounded-lg shadow-2xs hover:text-rose-600 transition-colors"
                  >
                    <span>Cấp độ: {lvl}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
                {minRating > 0 && (
                  <button
                    onClick={() => setMinRating(0)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E4E4E0] hover:border-rose-300 text-xs font-semibold text-[#16324F] rounded-lg shadow-2xs hover:text-rose-600 transition-colors"
                  >
                    <span>Đánh giá: ≥ {minRating}⭐</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {selectedDurations.map(dur => (
                  <button
                    key={dur}
                    onClick={() => toggleDuration(dur)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E4E4E0] hover:border-rose-300 text-xs font-semibold text-[#16324F] rounded-lg shadow-2xs hover:text-rose-600 transition-colors"
                  >
                    <span>Thời lượng</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
                {searchKeywords && (
                  <button
                    onClick={() => setSearchKeywords('')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E4E4E0] hover:border-rose-300 text-xs font-semibold text-[#16324F] rounded-lg shadow-2xs hover:text-rose-600 transition-colors"
                  >
                    <span>Từ khóa: "{searchKeywords}"</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 font-bold hover:underline ml-1 cursor-pointer"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* RESULTS GRID OR EMPTY STATE */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course, idx) => (
                  <div 
                    key={course.id} 
                    className="h-full animate-card-entry"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <CourseCardWithPreview
                      course={course}
                      onSelectCourse={onSelectCourse}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* EMPTY STATE */
              <div className="bg-white border border-[#E4E4E0] rounded-2xl p-12 text-center space-y-4 shadow-sm animate-card-entry">
                <div className="w-16 h-16 bg-[#FAF9FC] border border-[#E4E4E0] rounded-2xl flex items-center justify-center mx-auto text-[#16324F] shadow-xs">
                  <BookOpen className="w-8 h-8 text-[#16324F]" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-serif font-extrabold text-lg text-[#001D37]">
                    Chưa có khóa học nào trong chủ đề này
                  </h3>
                  <p className="text-xs text-[#5E5E5E] leading-relaxed">
                    Hệ thống đang chuẩn bị giáo trình cho chuyên mục này hoặc các tiêu chí bộ lọc hiện tại của bạn quá hẹp.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-[#FAF9FC] hover:bg-[#F4F3F6] text-[#16324F] border border-[#E4E4E0] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      Xóa bộ lọc hiện tại
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate('student-explore', 'all')}
                    className="px-5 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                  >
                    Khám phá tất cả khóa học
                  </button>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>

    </div>
  );
};
