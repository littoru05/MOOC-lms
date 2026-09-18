import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Clock, ArrowRight } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/format';

/**
 * CourseCard: Clean, high-performance course card adhering to Paper & Ink Design System.
 */
export const CourseCardWithPreview = ({ 
  course, 
  onSelectCourse,
  isEnrolled = false,
  cardClassName = ''
}) => {
  const navigate = useNavigate();
  const totalLessons = course.totalLessons || 
    (course.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 15);

  const handleCardClick = () => {
    if (onSelectCourse) {
      onSelectCourse(course.slug || course.id);
    } else {
      navigate(`/courses/${course.slug || course.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white border border-[#E4E4E0] rounded-2xl overflow-hidden hover:border-[#16324F] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between h-full group ${cardClassName}`}
    >
      <div>
        {/* Thumbnail & Badges */}
        <div className="aspect-video w-full overflow-hidden bg-[#EFEDF0] relative">
          <img
            src={getImageUrl(course.thumbnailUrl || course.thumbnail, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800')}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
          
          {/* Level Pill */}
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white/95 backdrop-blur-xs border border-[#E4E4E0] text-[10px] font-bold text-[#16324F] rounded-md shadow-2xs">
            {course.level || 'Trung cấp'}
          </span>

          {/* Category Tag */}
          {course.category && (
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#001D37]/90 text-white text-[9px] font-semibold rounded-md backdrop-blur-xs">
              {course.category.name}
            </span>
          )}
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-2">
          {/* Title */}
          <h3 className="font-serif text-sm sm:text-base font-bold text-[#001D37] line-clamp-2 group-hover:text-[#16324F] leading-snug">
            {course.title}
          </h3>

          {/* Short Description */}
          <p className="text-[11px] text-[#5E5E5E] line-clamp-2 leading-relaxed">
            {course.shortDescription || course.description}
          </p>

          {/* Instructor Info */}
          <div className="flex items-center gap-2 pt-1 text-xs">
            <img
              src={getImageUrl(course.instructor?.avatarUrl, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')}
              alt={course.instructor?.fullName}
              className="w-4 h-4 rounded-full object-cover border border-[#E4E4E0]"
            />
            <span className="text-[11px] font-medium text-[#1A1C1E] truncate">
              {course.instructor?.fullName || 'TS. Nguyễn Văn A'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-2.5 bg-[#FAF9FC] border-t border-[#E4E4E0] flex items-center justify-between text-[11px] text-[#5E5E5E]">
        <div className="flex items-center gap-1 font-bold text-amber-600">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{course.rating || 4.9}</span>
          <span className="text-[#6B6B6B] font-normal text-[10px]">
            ({(course.reviewCount || 1200).toLocaleString()})
          </span>
        </div>

        {/* Price Tag */}
        <div className="text-right">
          <span className={`text-xs font-bold ${Number(course.price) > 0 ? 'text-[#BA1A1A]' : 'text-emerald-700 font-semibold'}`}>
            {formatCurrency(course.price)}
          </span>
        </div>
      </div>
    </div>
  );
};
