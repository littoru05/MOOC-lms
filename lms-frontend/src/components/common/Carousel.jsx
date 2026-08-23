import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

/**
 * Reusable Carousel Component with automatic conveyor motion (autoPlay),
 * smooth CSS snap, mouse drag-to-scroll, and pause-on-hover.
 */
export const Carousel = ({
  title,
  subtitle,
  icon,
  badge,
  actionButton,
  items = [],
  renderItem,
  itemClassName = 'w-[280px] sm:w-[320px] md:w-[330px] shrink-0 snap-start',
  autoPlay = true,
  autoPlayInterval = 3200
}) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Drag to scroll states
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Check scroll boundary to enable/disable arrow buttons
  const checkScrollBounds = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollBounds();
    el.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds);

    return () => {
      el.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [items, checkScrollBounds]);

  // Scroll by step (approx 1-2 cards width)
  const handleScrollStep = useCallback((direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollAmount = Math.max(el.clientWidth * 0.75, 300);

    if (direction === 'right') {
      // If reached end, seamlessly loop back to start
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft <= 10) {
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  }, []);

  // Automatic Conveyor Belt Effect (Auto-slide timer)
  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const timer = setInterval(() => {
      if (!isMouseDownRef.current) {
        handleScrollStep('right');
      }
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, isPaused, autoPlayInterval, handleScrollStep]);

  // Mouse Drag to Scroll Event Handlers
  const handleMouseDown = (e) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.3; // Scroll multiplier

    if (Math.abs(walk) > 6) {
      hasDraggedRef.current = true;
    }

    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
  };

  // Prevent accidental click trigger when dragging
  const handleCaptureClick = (e) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasDraggedRef.current = false;
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section
      className="space-y-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header with Title & Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {badge && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#F4F3F6] text-[#16324F] border border-[#E4E4E0] uppercase tracking-wider">
                {badge}
              </span>
            )}
            {autoPlay && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold rounded-full border transition-all ${isPaused
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                  }`}
                title={isPaused ? 'Đang tạm dừng khi di chuột' : 'Đang tự động chuyển động'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                <span>{isPaused ? 'Tạm dừng (Rà chuột)' : 'Băng chuyền tự động'}</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#001D37] flex items-center gap-2.5">
            {icon && <span className="text-[#16324F]">{icon}</span>}
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="text-xs text-[#5E5E5E] max-w-2xl">{subtitle}</p>
          )}
        </div>

        {/* Right Actions & Arrows */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {actionButton}

          {/* Desktop / Tablet Scroll Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E4E4E0] shadow-2xs">
            <button
              onClick={() => handleScrollStep('left')}
              className="p-1.5 rounded-lg transition-all hover:bg-[#F4F3F6] text-[#16324F] active:scale-95 cursor-pointer"
              title="Cuộn sang trái"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-[#E4E4E0]"></div>
            <button
              onClick={() => handleScrollStep('right')}
              className="p-1.5 rounded-lg transition-all hover:bg-[#F4F3F6] text-[#16324F] active:scale-95 cursor-pointer"
              title="Cuộn sang phải"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onClickCapture={handleCaptureClick}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth select-none no-scrollbar cursor-grab active:cursor-grabbing"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {items.map((item, idx) => (
            <div key={item.id || idx} className={itemClassName}>
              {renderItem(item, idx)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
