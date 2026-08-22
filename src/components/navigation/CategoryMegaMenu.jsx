import React, { useState, useRef, useEffect } from 'react';
import { MEGA_MENU_CATEGORIES } from '../../data/categoryMenu';
import { 
  ChevronDown, 
  ChevronRight, 
  Globe, 
  Smartphone, 
  Cpu, 
  BarChart3, 
  Cloud, 
  ShieldCheck, 
  Database, 
  Layout, 
  Sparkles,
  BookOpen,
  ArrowRight,
  Hash
} from 'lucide-react';

// Icon Map Helper
const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case 'Globe': return <Globe className="w-4 h-4 text-blue-600" />;
    case 'Smartphone': return <Smartphone className="w-4 h-4 text-emerald-600" />;
    case 'Cpu': return <Cpu className="w-4 h-4 text-purple-600" />;
    case 'BarChart3': return <BarChart3 className="w-4 h-4 text-amber-600" />;
    case 'Cloud': return <Cloud className="w-4 h-4 text-sky-600" />;
    case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-rose-600" />;
    case 'Database': return <Database className="w-4 h-4 text-indigo-600" />;
    case 'Layout': return <Layout className="w-4 h-4 text-pink-600" />;
    default: return <BookOpen className="w-4 h-4 text-[#16324F]" />;
  }
};

export const CategoryMegaMenu = ({ onSelectCategory, isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);
  const [activeSubcategoryIdx, setActiveSubcategoryIdx] = useState(0);
  
  // Mobile accordion state
  const [mobileExpandedCat, setMobileExpandedCat] = useState(null);
  const [mobileExpandedSub, setMobileExpandedSub] = useState(null);

  const containerRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Handle Mouse Enter with debounce cancel
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  // Handle Mouse Leave with ~200ms debounce
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 220);
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

  const currentCategory = MEGA_MENU_CATEGORIES[activeCategoryIdx] || MEGA_MENU_CATEGORIES[0];
  const currentSubcategory = currentCategory?.subcategories?.[activeSubcategoryIdx] || currentCategory?.subcategories?.[0];

  const handleItemClick = (query) => {
    setIsOpen(false);
    if (onSelectCategory) {
      onSelectCategory(query);
    }
  };

  // Mobile Accordion View
  if (isMobile) {
    return (
      <div className="w-full space-y-2 py-2">
        <div className="text-[11px] font-bold text-[#5E5E5E] uppercase tracking-wider px-3 mb-1">
          Khám phá theo danh mục
        </div>
        <div className="space-y-1">
          {MEGA_MENU_CATEGORIES.map((cat) => {
            const isCatOpen = mobileExpandedCat === cat.id;
            return (
              <div key={cat.id} className="border border-[#E4E4E0] rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setMobileExpandedCat(isCatOpen ? null : cat.id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-[#1A1C1E] hover:bg-[#FAF9FC]"
                >
                  <div className="flex items-center gap-2.5">
                    {getCategoryIcon(cat.iconName)}
                    <span>{cat.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#5E5E5E] transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCatOpen && (
                  <div className="bg-[#FAF9FC] border-t border-[#E4E4E0] p-3 space-y-3">
                    {cat.subcategories.map((sub) => {
                      const isSubOpen = mobileExpandedSub === sub.id;
                      return (
                        <div key={sub.id} className="space-y-1.5 pl-2 border-l-2 border-[#16324F]/20">
                          <button
                            onClick={() => setMobileExpandedSub(isSubOpen ? null : sub.id)}
                            className="w-full flex items-center justify-between text-left text-xs font-medium text-[#16324F] hover:underline"
                          >
                            <span>{sub.name}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-[#5E5E5E] transition-transform ${isSubOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isSubOpen && (
                            <div className="pl-3 py-1 space-y-1">
                              {sub.topics.map((topic) => (
                                <button
                                  key={topic.id}
                                  onClick={() => handleItemClick(topic.name)}
                                  className="w-full text-left text-[11px] text-[#5E5E5E] hover:text-[#16324F] py-1 flex items-center gap-1.5"
                                >
                                  <Hash className="w-3 h-3 text-[#16324F]/50" />
                                  <span>{topic.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop Mega Menu Panel View
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

      {/* Mega Dropdown Panel (Full Width Floating Container) */}
      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-1.5 w-[920px] max-w-[94vw] bg-white border border-[#E4E4E0] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ transformOrigin: 'top left' }}
        >
          <div className="grid grid-cols-12 min-h-[420px] divide-x divide-[#E4E4E0]">
            
            {/* COLUMN 1: Main Categories (4 Columns / 33%) */}
            <div className="col-span-4 p-3 bg-white space-y-0.5 overflow-y-auto max-h-[460px]">
              <div className="px-3 py-2 text-[10px] font-bold text-[#5E5E5E] uppercase tracking-wider">
                Lĩnh vực đào tạo chính
              </div>

              {MEGA_MENU_CATEGORIES.map((category, idx) => {
                const isActive = activeCategoryIdx === idx;
                return (
                  <button
                    key={category.id}
                    onMouseEnter={() => {
                      setActiveCategoryIdx(idx);
                      setActiveSubcategoryIdx(0);
                    }}
                    onClick={() => handleItemClick(category.slug || category.name)}
                    className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#F4F3F6] text-[#16324F] font-bold shadow-2xs'
                        : 'text-[#1A1C1E] hover:bg-[#FAF9FC] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-white shadow-2xs' : 'bg-[#FAF9FC]'}`}>
                        {getCategoryIcon(category.iconName)}
                      </div>
                      <span className="truncate">{category.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {category.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {category.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-[#16324F] translate-x-0.5' : 'text-[#C3C6CE]'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* COLUMN 2: Subcategories (4 Columns / 33%) */}
            <div className="col-span-4 p-3 bg-[#FAF9FC]/60 space-y-0.5 overflow-y-auto max-h-[460px]">
              <div className="px-3 py-2 text-[10px] font-bold text-[#5E5E5E] uppercase tracking-wider flex items-center justify-between">
                <span>Chuyên mục con</span>
                <span className="text-[10px] text-[#16324F] font-semibold">{currentCategory.name}</span>
              </div>

              {currentCategory?.subcategories?.map((sub, idx) => {
                const isActive = activeSubcategoryIdx === idx;
                return (
                  <button
                    key={sub.id}
                    onMouseEnter={() => setActiveSubcategoryIdx(idx)}
                    onClick={() => handleItemClick(sub.slug || sub.name)}
                    className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#16324F] font-bold shadow-xs border border-[#E4E4E0]'
                        : 'text-[#1A1C1E] hover:bg-white/80 font-medium'
                    }`}
                  >
                    <span className="truncate pr-2">{sub.name}</span>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? 'text-[#16324F] translate-x-0.5' : 'text-[#C3C6CE]'}`} />
                  </button>
                );
              })}
            </div>

            {/* COLUMN 3: Popular Topics & Keywords (4 Columns / 34%) */}
            <div className="col-span-4 p-4 bg-white overflow-y-auto max-h-[460px] space-y-3">
              <div className="border-b border-[#E4E4E0] pb-2 px-1">
                <span className="text-[10px] font-bold text-[#16324F] uppercase tracking-wider block">
                  Các chủ đề phổ biến
                </span>
                <h4 className="font-serif font-bold text-sm text-[#001D37] mt-0.5 line-clamp-1">
                  {currentSubcategory?.name || 'Tất cả chủ đề'}
                </h4>
              </div>

              <div className="space-y-1">
                {currentSubcategory?.topics?.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleItemClick(topic.slug || topic.name)}
                    className="w-full text-left p-2 rounded-xl text-xs text-[#5E5E5E] hover:text-[#16324F] hover:bg-[#F4F3F6] transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#16324F]/30 group-hover:bg-[#16324F] group-hover:scale-125 transition-all shrink-0"></div>
                      <span className="group-hover:translate-x-0.5 transition-transform font-medium truncate">{topic.name}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-[#16324F] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
