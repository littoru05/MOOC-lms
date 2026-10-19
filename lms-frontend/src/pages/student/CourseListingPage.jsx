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
  Tag,
  Banknote
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CourseCardWithPreview } from '../../components/course/CourseCardWithPreview';
import { usePublishedCourses, useCategories, useMyEnrollments } from '../../hooks/useCourses';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/format';
import { findCategoryHierarchyBySlug } from '../../data/categoryMenu';

export const CourseListingPage = ({ 
  filterQuery: filterQueryProp = '', 
  onSelectCourse, 
  onNavigate 
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const filterQuery = filterQueryProp || searchParams.get('category') || searchParams.get('q') || '';
  const currentCategorySlug = searchParams.get('category') || (filterQuery !== 'all' ? filterQuery : '') || '';

  // Read Price Filter params from URL query string
  const priceType = searchParams.get('priceType') || 'all';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Load published courses, categories, and student enrollments from Backend via React Query
  const { data: courses = [] } = usePublishedCourses();
  const { data: categories = [] } = useCategories();
  const { data: myEnrollments = [] } = useMyEnrollments(Boolean(user));

  // Set of enrolled course IDs for the logged-in student
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

  // Parsing Category Info from Filter Query (Prioritizing Backend Categories)
  const categoryInfo = useMemo(() => {
    if (!filterQuery || filterQuery === 'all') {
      return {
        level: 1,
        type: 'all',
        slug: 'all',
        title: 'Tất cả chương trình đào tạo',
        breadcrumbs: [
          { name: 'Trang chủ', slug: 'home' },
          { name: 'Tất cả khóa học', slug: 'all' }
        ]
      };
    }

    const found = categories?.find(
      (c) =>
        (c.slug && c.slug.toLowerCase() === filterQuery.toLowerCase()) ||
        String(c.id) === filterQuery ||
        (c.name && c.name.toLowerCase() === filterQuery.toLowerCase())
    );

    if (found) {
      return {
        level: 1,
        type: 'category',
        slug: found.slug,
        title: found.name,
        breadcrumbs: [
          { name: 'Trang chủ', slug: 'home' },
          { name: found.name, slug: found.slug }
        ]
      };
    }

    return findCategoryHierarchyBySlug(filterQuery) || {
      level: 1,
      type: 'search',
      slug: filterQuery,
      title: `Kết quả tìm kiếm cho "${filterQuery}"`,
      breadcrumbs: [
        { name: 'Trang chủ', slug: 'home' },
        { name: `Tìm kiếm: ${filterQuery}`, slug: filterQuery }
      ]
    };
  }, [filterQuery, categories]);

  // Filter States
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'students' | 'newest'
  const [searchKeywords, setSearchKeywords] = useState('');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Sync / Update Category in URL Search Params
  const handleCategoryChange = (catSlug) => {
    const params = new URLSearchParams(searchParams);
    if (!catSlug || catSlug === 'all') {
      params.delete('category');
      params.delete('q');
    } else {
      params.set('category', catSlug);
      params.delete('q');
    }
    setSearchParams(params);
  };

  // Sync / Update Price Filter in URL Search Params
  const handlePriceTypeChange = (type) => {
    const params = new URLSearchParams(searchParams);
    if (type === 'all') {
      params.delete('priceType');
      params.delete('minPrice');
      params.delete('maxPrice');
    } else if (type === 'free') {
      params.set('priceType', 'free');
      params.delete('minPrice');
      params.delete('maxPrice');
    } else {
      params.set('priceType', 'paid');
    }
    setSearchParams(params);
  };

  const handlePriceRangeChange = (min, max) => {
    const params = new URLSearchParams(searchParams);
    params.set('priceType', 'paid');
    if (min !== '' && min !== null && min !== undefined) {
      params.set('minPrice', String(min));
    } else {
      params.delete('minPrice');
    }
    if (max !== '' && max !== null && max !== undefined) {
      params.set('maxPrice', String(max));
    } else {
      params.delete('maxPrice');
    }
    setSearchParams(params);
  };

  // Reset search keyword when filterQuery changes
  useEffect(() => {
    setSearchKeywords('');
  }, [filterQuery]);

  // Filter & Search Logic
  const filteredCourses = useMemo(() => {
    const q = (filterQuery || '').toLowerCase().trim();
    const selectedCat = categories?.find(
      (c) =>
        (c.slug && c.slug.toLowerCase() === q) ||
        String(c.id) === q ||
        (c.name && c.name.toLowerCase() === q)
    );

    return courses.filter((course) => {
      // 0. Price Filter
      let matchesPrice = true;
      const coursePrice = Number(course.price) || 0;
      if (priceType === 'free') {
        matchesPrice = coursePrice === 0;
      } else if (priceType === 'paid') {
        matchesPrice = coursePrice > 0;
        if (minPrice && !isNaN(Number(minPrice))) {
          matchesPrice = matchesPrice && coursePrice >= Number(minPrice);
        }
        if (maxPrice && !isNaN(Number(maxPrice))) {
          matchesPrice = matchesPrice && coursePrice <= Number(maxPrice);
        }
      }

      // 1. Hierarchy Category matching
      let matchesCategory = true;
      if (q && q !== 'all') {
        const catSlug = course.categorySlug?.toLowerCase();
        const catName = course.categoryName?.toLowerCase();

        matchesCategory = Boolean(
          catSlug === q ||
          (selectedCat && course.categoryId === selectedCat.id) ||
          catName === q ||
          (selectedCat && catName === selectedCat.name?.toLowerCase()) ||
          course.title?.toLowerCase().includes(q)
        );
      }

      // 2. Keyword search filter
      let matchesKeywords = true;
      if (searchKeywords.trim()) {
        const kw = searchKeywords.toLowerCase().trim();
        matchesKeywords = 
          course.title?.toLowerCase().includes(kw) ||
          course.shortDescription?.toLowerCase().includes(kw) ||
          course.description?.toLowerCase().includes(kw) ||
          course.instructorName?.toLowerCase().includes(kw) ||
          course.instructor?.fullName?.toLowerCase().includes(kw);
      }

      return matchesPrice && matchesCategory && matchesKeywords;
    }).sort((a, b) => {
      if (sortBy === 'students') return (b.enrolledCount || b.students || 0) - (a.enrolledCount || a.students || 0);
      if (sortBy === 'newest') return b.id - a.id;
      // Default: Popular (sort by enrolled count desc)
      return (b.enrolledCount || 0) - (a.enrolledCount || 0);
    });
  }, [courses, categories, filterQuery, priceType, minPrice, maxPrice, searchKeywords, sortBy]);

  const handleResetFilters = () => {
    setSearchKeywords('');
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    params.delete('q');
    params.delete('priceType');
    params.delete('minPrice');
    params.delete('maxPrice');
    setSearchParams(params);
  };

  const hasActiveFilters = 
    searchKeywords !== '' ||
    Boolean(searchParams.get('category')) ||
    priceType !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '';

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
                      if (crumb.slug === 'home') {
                        if (onNavigate) onNavigate('student-explore');
                        else navigate('/');
                      } else {
                        if (onNavigate) onNavigate('student-explore', crumb.slug);
                        else navigate(`/courses?category=${encodeURIComponent(crumb.slug)}`);
                      }
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
            <span>Bộ lọc {hasActiveFilters && '(Đang lọc)'}</span>
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

            {/* Filter Group: Category (Danh mục đào tạo) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-[#001D37] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#16324F]" />
                  <span>Danh mục đào tạo</span>
                </h4>
                {Boolean(currentCategorySlug) && currentCategorySlug !== 'all' && (
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                )}
              </div>

              {/* Category Dropdown Select */}
              <div className="relative">
                <select
                  aria-label="Chọn danh mục"
                  value={currentCategorySlug || 'all'}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-[#FAF9FC] hover:bg-white border border-[#E4E4E0] focus:border-[#16324F] rounded-xl px-3 py-2 text-xs font-semibold text-[#16324F] appearance-none focus:outline-none focus:ring-1 focus:ring-[#16324F]/20 transition-all cursor-pointer shadow-2xs pr-8"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories?.map((cat) => (
                    <option key={cat.id || cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#5E5E5E] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter Group: Price (Học phí VNĐ) */}
            <div className="space-y-3 pt-4 border-t border-[#E4E4E0]">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-[#001D37] uppercase tracking-wider flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-[#16324F]" />
                  <span>Học phí</span>
                </h4>
                {(priceType !== 'all' || minPrice || maxPrice) && (
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                )}
              </div>

              {/* 3 Tabs / Buttons */}
              <div className="grid grid-cols-3 gap-1 bg-[#F4F3F6] p-1 rounded-xl border border-[#E4E4E0]">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'free', label: 'Miễn phí' },
                  { id: 'paid', label: 'Có phí' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handlePriceTypeChange(tab.id)}
                    className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center truncate ${
                      priceType === tab.id
                        ? 'bg-white text-[#16324F] shadow-xs'
                        : 'text-[#5E5E5E] hover:text-[#1A1C1E]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Paid Price Range Inputs & Presets */}
              {priceType === 'paid' && (
                <div className="space-y-2.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="bg-[#FAF9FC] p-2.5 rounded-xl border border-[#E4E4E0] space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-[#5E5E5E]">
                      <span>Khoảng giá:</span>
                      <span className="text-[#16324F] font-bold">
                        {minPrice ? formatCurrency(minPrice) : '0₫'} - {maxPrice ? formatCurrency(maxPrice) : 'Tối đa'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-[#5E5E5E] block mb-0.5 font-medium">Từ (₫):</label>
                        <input
                          type="number"
                          min="0"
                          step="50000"
                          value={minPrice}
                          onChange={(e) => handlePriceRangeChange(e.target.value, maxPrice)}
                          placeholder="0"
                          className="w-full px-2 py-1 text-xs bg-white border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#5E5E5E] block mb-0.5 font-medium">Đến (₫):</label>
                        <input
                          type="number"
                          min="0"
                          step="50000"
                          value={maxPrice}
                          onChange={(e) => handlePriceRangeChange(minPrice, e.target.value)}
                          placeholder="5.000.000"
                          className="w-full px-2 py-1 text-xs bg-white border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preset Price Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '< 500k', min: 0, max: 500000 },
                      { label: '500k - 1tr', min: 500000, max: 1000000 },
                      { label: '> 1tr', min: 1000000, max: '' },
                    ].map((preset, idx) => {
                      const isActive =
                        String(minPrice) === String(preset.min) &&
                        String(maxPrice) === String(preset.max);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePriceRangeChange(preset.min, preset.max)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#16324F] text-white border-[#16324F]'
                              : 'bg-white text-[#5E5E5E] border-[#E4E4E0] hover:border-[#16324F] hover:text-[#16324F]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
                  <option value="students">Học viên nhiều nhất</option>
                  <option value="newest">Mới cập nhật</option>
                </select>
              </div>
            </div>

            {/* Active Filter Badges */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-[#5E5E5E]">Đang lọc:</span>
                {Boolean(currentCategorySlug) && currentCategorySlug !== 'all' && (
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E4E4E0] hover:border-rose-300 text-xs font-semibold text-[#16324F] rounded-lg shadow-2xs hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <span>Danh mục: {categoryInfo?.title || currentCategorySlug}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {priceType !== 'all' && (
                  <button
                    onClick={() => handlePriceTypeChange('all')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E4E4E0] hover:border-rose-300 text-xs font-semibold text-[#16324F] rounded-lg shadow-2xs hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <span>
                      {priceType === 'free'
                        ? 'Học phí: Miễn phí'
                        : minPrice || maxPrice
                          ? `Học phí: ${minPrice ? formatCurrency(minPrice) : '0₫'} - ${maxPrice ? formatCurrency(maxPrice) : 'Tối đa'}`
                          : 'Học phí: Có phí'}
                    </span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {searchKeywords && (
                  <button
                    onClick={() => setSearchKeywords('')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E4E4E0] hover:border-rose-300 text-xs font-semibold text-[#16324F] rounded-lg shadow-2xs hover:text-rose-600 transition-colors cursor-pointer"
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
                      isEnrolled={enrolledCourseIds.has(course.id)}
                      onSelectCourse={onSelectCourse || ((slug) => navigate(`/courses/${slug}`))}
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
                    onClick={() => onNavigate ? onNavigate('student-explore', 'all') : navigate('/courses')}
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
