import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories, usePublishedCourses } from '../../hooks/useCourses';
import { getImageUrl } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/format';
import { 
  ChevronDown, 
  ChevronRight, 
  Globe, 
  Smartphone, 
  Cpu, 
  Cloud, 
  ShieldCheck, 
  Database, 
  Layout, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  Layers
} from 'lucide-react';

/**
 * Dynamic Icon mapping based on Category slug or name from Backend
 */
export const getCategoryIcon = (slugOrName) => {
  const s = (slugOrName || '').toLowerCase();
  if (s.includes('web')) return <Globe className="w-4 h-4 text-blue-600" />;
  if (s.includes('ai') || s.includes('tri-tue') || s.includes('machine') || s.includes('data-science')) {
    return <Cpu className="w-4 h-4 text-purple-600" />;
  }
  if (s.includes('di-dong') || s.includes('mobile')) return <Smartphone className="w-4 h-4 text-emerald-600" />;
  if (s.includes('devops') || s.includes('cloud')) return <Cloud className="w-4 h-4 text-sky-600" />;
  if (s.includes('ui-ux') || s.includes('thiet-ke') || s.includes('design')) return <Layout className="w-4 h-4 text-pink-600" />;
  if (s.includes('an-ninh') || s.includes('bao-mat') || s.includes('security')) return <ShieldCheck className="w-4 h-4 text-rose-600" />;
  if (s.includes('du-lieu') || s.includes('database') || s.includes('sql') || s.includes('data-engineering')) {
    return <Database className="w-4 h-4 text-amber-600" />;
  }
  return <BookOpen className="w-4 h-4 text-[#16324F]" />;
};

export const CategoryMegaMenu = ({ onSelectCategory, isMobile = false }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState('all');

  // Load real categories and published courses from Backend via React Query
  const { data: categories = [] } = useCategories();
  const { data: courses = [] } = usePublishedCourses();

  const containerRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Mouse enter debounce
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  // Mouse leave debounce (~200ms)
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Currently selected category object (or null if 'all')
  const activeCategory = useMemo(() => {
    if (activeCategoryId === 'all') return null;
    return categories.find((c) => c.id === activeCategoryId || c.slug === activeCategoryId) || null;
  }, [activeCategoryId, categories]);

  // Courses filtered for preview in right column
  const displayedCourses = useMemo(() => {
    if (!activeCategory) {
      // Top 4 popular courses
      return courses
        .slice()
        .sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0))
        .slice(0, 4);
    }
    return courses
      .filter((c) => c.categoryId === activeCategory.id || c.categorySlug === activeCategory.slug)
      .slice(0, 4);
  }, [activeCategory, courses]);

  const handleItemClick = (query) => {
    setIsOpen(false);
    if (onSelectCategory) {
      onSelectCategory(query);
    } else {
      if (!query || query === 'all') {
        navigate('/courses');
      } else {
        navigate(`/courses?category=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleCourseClick = (slugOrId) => {
    setIsOpen(false);
    navigate(`/courses/${slugOrId}`);
  };

  // Mobile Accordion View
  if (isMobile) {
    return (
      <div className="w-full space-y-2 py-2">
        <div className="text-[11px] font-bold text-[#5E5E5E] uppercase tracking-wider px-3 mb-1">
          Khám phá theo danh mục
        </div>
        <div className="space-y-1">
          <button
            onClick={() => handleItemClick('all')}
            className="w-full px-3 py-2 rounded-lg text-left flex items-center justify-between text-xs font-semibold text-[#16324F] hover:bg-[#FAF9FC] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Tất cả khóa học</span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold">({courses.length})</span>
          </button>

          {categories.map((cat) => {
            const count = courses.filter((c) => c.categoryId === cat.id || c.categorySlug === cat.slug).length;
            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => handleItemClick(cat.slug || cat.name)}
                className="w-full px-3 py-2 rounded-lg text-left flex items-center justify-between text-xs text-[#1A1C1E] hover:bg-[#FAF9FC] hover:text-[#16324F] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  {getCategoryIcon(cat.slug || cat.name)}
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">({count})</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop 2-Column Mega Menu Panel View
  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
          isOpen
            ? 'text-[#16324F] bg-[#F4F3F6] font-bold shadow-2xs'
            : 'text-[#1A1C1E] hover:text-[#16324F] hover:bg-[#FAF9FC]'
        }`}
      >
        <span>Khám phá khóa học</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#16324F] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#16324F]' : ''
          }`}
        />
      </button>

      {/* Dropdown Panel: 2 Columns (Categories List + Real Courses Preview) */}
      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-1.5 w-[760px] max-w-[94vw] bg-white border border-[#E4E4E0] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ transformOrigin: 'top left' }}
        >
          <div className="grid grid-cols-12 min-h-[380px] divide-x divide-[#E4E4E0]">
            
            {/* COLUMN 1: Categories from Backend (5 Columns / ~42%) */}
            <div className="col-span-5 p-3 bg-white space-y-0.5 overflow-y-auto max-h-[460px]">
              <div className="px-3 py-2 text-[10px] font-bold text-[#5E5E5E] uppercase tracking-wider flex items-center justify-between">
                <span>Lĩnh vực đào tạo</span>
                <span className="text-[10px] text-slate-400 font-normal">{categories.length} chuyên mục</span>
              </div>

              {/* Tất cả khóa học Option */}
              <button
                onMouseEnter={() => setActiveCategoryId('all')}
                onClick={() => handleItemClick('all')}
                className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                  activeCategoryId === 'all'
                    ? 'bg-[#F4F3F6] text-[#16324F] font-bold shadow-2xs'
                    : 'text-[#1A1C1E] hover:bg-[#FAF9FC] font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  <div className={`p-1.5 rounded-lg shrink-0 ${activeCategoryId === 'all' ? 'bg-white shadow-2xs' : 'bg-[#FAF9FC]'}`}>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="truncate">Tất cả khóa học</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-slate-100 text-slate-600">
                    {courses.length}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeCategoryId === 'all' ? 'text-[#16324F] translate-x-0.5' : 'text-[#C3C6CE]'}`} />
                </div>
              </button>

              {/* Dynamic Real Categories from Database */}
              {categories.map((category) => {
                const isActive = activeCategoryId === category.id || activeCategoryId === category.slug;
                const count = courses.filter((c) => c.categoryId === category.id || c.categorySlug === category.slug).length;

                return (
                  <button
                    key={category.id || category.slug}
                    onMouseEnter={() => setActiveCategoryId(category.id)}
                    onClick={() => handleItemClick(category.slug || category.name)}
                    className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#F4F3F6] text-[#16324F] font-bold shadow-2xs'
                        : 'text-[#1A1C1E] hover:bg-[#FAF9FC] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-white shadow-2xs' : 'bg-[#FAF9FC]'}`}>
                        {getCategoryIcon(category.slug || category.name)}
                      </div>
                      <span className="truncate">{category.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-slate-100 text-slate-600">
                        {count}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-[#16324F] translate-x-0.5' : 'text-[#C3C6CE]'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* COLUMN 2: Real Courses Preview in Active Category (7 Columns / ~58%) */}
            <div className="col-span-7 p-4 bg-[#FAF9FC]/60 flex flex-col justify-between overflow-y-auto max-h-[460px]">
              <div>
                {/* Category Header */}
                <div className="flex items-start justify-between gap-3 border-b border-[#E4E4E0] pb-3 mb-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#5E5E5E] uppercase tracking-wider block">
                      {activeCategoryId === 'all' ? 'Toàn bộ chuyên mục' : 'Khóa học tiêu biểu'}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#001D37] mt-0.5 truncate">
                      {activeCategory?.name || 'Tất cả chương trình đào tạo'}
                    </h4>
                    <p className="text-[11px] text-[#5E5E5E] line-clamp-1 mt-0.5">
                      {activeCategory?.description || 'Hệ thống các chương trình đào tạo công nghệ chất lượng cao.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleItemClick(activeCategory?.slug || 'all')}
                    className="text-xs text-[#16324F] font-bold hover:underline shrink-0 flex items-center gap-1 cursor-pointer pt-0.5"
                  >
                    <span>Xem tất cả</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Real Courses Preview List */}
                {displayedCourses.length > 0 ? (
                  <div className="space-y-2">
                    {displayedCourses.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => handleCourseClick(course.slug || course.id)}
                        className="bg-white border border-[#E4E4E0] hover:border-[#16324F] hover:shadow-xs rounded-xl p-2.5 transition-all flex items-center gap-3 cursor-pointer group"
                      >
                        <img
                          src={getImageUrl(course.thumbnailUrl || course.thumbnail, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300')}
                          alt={course.title}
                          className="w-16 h-11 rounded-lg object-cover bg-slate-100 shrink-0 group-hover:scale-102 transition-transform"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-serif text-xs font-bold text-[#001D37] group-hover:text-[#16324F] line-clamp-1">
                            {course.title}
                          </h5>
                          <div className="flex items-center gap-2 text-[10px] text-[#5E5E5E] mt-0.5">
                            <span className="truncate">{course.instructor?.fullName || course.instructorName || 'Giảng viên EduMOOC'}</span>
                            <span>•</span>
                            <span>{(course.enrolledCount || 0).toLocaleString()} học viên</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-xs font-bold ${Number(course.price) > 0 ? 'text-[#BA1A1A]' : 'text-emerald-700'}`}>
                            {formatCurrency(course.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white border border-[#E4E4E0] rounded-xl my-3">
                    <BookOpen className="w-8 h-8 text-[#6B6B6B] mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-bold text-[#1A1C1E]">Chưa có khóa học trong danh mục này</p>
                    <p className="text-[11px] text-[#5E5E5E] mt-1">Giảng viên đang biên soạn nội dung mới.</p>
                  </div>
                )}
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-3 border-t border-[#E4E4E0] mt-3 flex items-center justify-between text-xs text-[#5E5E5E]">
                <span>
                  {activeCategory 
                    ? `Hiện có ${displayedCourses.length} khóa học trong chuyên mục` 
                    : `Tổng cộng ${courses.length} khóa học trên hệ thống`}
                </span>
                <button
                  onClick={() => handleItemClick(activeCategory?.slug || 'all')}
                  className="text-xs font-bold text-[#16324F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Mở danh sách đầy đủ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
