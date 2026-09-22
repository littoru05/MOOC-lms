import React, { useState, useMemo, useEffect } from 'react';
import { useTeachingCourses } from '../../hooks/useCourses';
import { useInstructorStudents } from '../../hooks/useInstructorStudents';
import {
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  Award,
  Loader2,
  TrendingUp,
  Filter
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';
import { Pagination } from '../../components/common/Pagination';

export const StudentProgressPage = () => {
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch danh sách khóa học của Giảng viên để hiển thị Dropdown bộ lọc
  const { data: courses = [], isLoading: loadingCourses } = useTeachingCourses();

  // 2. Fetch danh sách học viên thật theo khóa học hoặc tất cả
  const {
    data: students = [],
    isLoading: loadingStudents,
    isError,
    error
  } = useInstructorStudents(selectedCourseId);

  // Lọc học viên theo ô tìm kiếm
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return (
        (s.fullName && s.fullName.toLowerCase().includes(query)) ||
        (s.email && s.email.toLowerCase().includes(query)) ||
        (s.courseTitle && s.courseTitle.toLowerCase().includes(query))
      );
    });
  }, [students, searchQuery]);

  // Client-side pagination state (5 items / page)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  // Reset về trang 1 khi đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourseId, searchQuery]);

  // Sắp xếp mặc định giảm dần theo ngày ghi danh mới nhất
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      const timeA = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0;
      const timeB = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [filteredStudents]);

  // Phân trang cục bộ
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedStudents.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedStudents, currentPage]);

  // Tính toán các chỉ số tổng quan thời gian thực
  const totalStudents = students.length;
  const completedCount = students.filter((s) => s.isCompleted).length;
  const inProgressCount = totalStudents - completedCount;
  const avgProgress =
    totalStudents > 0
      ? Math.round(
          students.reduce((acc, curr) => acc + Number(curr.progressPercent || 0), 0) / totalStudents
        )
      : 0;

  return (
    <div className="py-10 px-8 space-y-8">
      {/* Header & Bộ lọc */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-[#16324F] uppercase tracking-wider">
            Theo dõi Học tập
          </span>
          <h1 className="text-2xl font-bold font-serif text-[#001D37] mt-1">
            Tiến độ & Kết quả Học viên
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-1">
            Theo dõi tỷ lệ hoàn thành bài học và kết quả khảo thí Quiz của các học viên ghi danh khóa học của bạn
          </p>
        </div>

        {/* Course Filter Dropdown & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full sm:w-64 appearance-none bg-[#FAF9FC] border border-[#E4E4E0] rounded-lg px-3 py-2 text-xs font-medium text-[#1A1C1E] focus:outline-none focus:border-[#16324F] focus:bg-white cursor-pointer pr-8 shadow-2xs"
            >
              <option value="all">Tất cả khóa học ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-[#6B6B6B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center bg-[#FAF9FC] border border-[#E4E4E0] rounded-lg px-3 py-2 w-full sm:w-64 focus-within:border-[#16324F] focus-within:bg-white shadow-2xs">
            <Search className="w-3.5 h-3.5 text-[#6B6B6B] mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên, email học viên..."
              className="w-full text-xs bg-transparent focus:outline-none text-[#1A1C1E]"
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#16324F] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#5E5E5E] font-medium">Tổng học viên</p>
            <h3 className="text-xl font-bold font-serif text-[#001D37] mt-0.5">{totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#5E5E5E] font-medium">Đã tốt nghiệp</p>
            <h3 className="text-xl font-bold font-serif text-emerald-600 mt-0.5">{completedCount}</h3>
          </div>
        </div>

        <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#5E5E5E] font-medium">Đang học</p>
            <h3 className="text-xl font-bold font-serif text-amber-600 mt-0.5">{inProgressCount}</h3>
          </div>
        </div>

        <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#5E5E5E] font-medium">Tiến độ trung bình</p>
            <h3 className="text-xl font-bold font-serif text-indigo-600 mt-0.5">{avgProgress}%</h3>
          </div>
        </div>
      </div>

      {/* Student Progress Table */}
      <div className="bg-white border border-[#E4E4E0] rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#E4E4E0] flex items-center justify-between">
          <h3 className="font-serif font-bold text-[#001D37] text-base">
            Danh sách học viên theo dõi ({filteredStudents.length})
          </h3>
          {loadingStudents && (
            <div className="flex items-center gap-2 text-xs text-[#5E5E5E]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16324F]" />
              <span>Đang tải dữ liệu thực...</span>
            </div>
          )}
        </div>

        {loadingStudents ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#16324F] animate-spin" />
            <p className="text-xs text-[#5E5E5E]">Đang đồng bộ tiến độ học viên từ hệ thống...</p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-xs text-red-600 space-y-1">
            <p className="font-semibold">Không thể tải tiến độ học viên</p>
            <p className="text-[11px] text-[#5E5E5E]">{error?.response?.data?.message || error?.message}</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <BookOpen className="w-10 h-10 text-[#5E5E5E] mx-auto opacity-40" />
            <p className="text-sm font-semibold text-[#1A1C1E]">Không tìm thấy học viên nào</p>
            <p className="text-xs text-[#5E5E5E]">
              {selectedCourseId !== 'all'
                ? 'Khóa học này hiện chưa có học viên nào ghi danh hoặc không khớp từ khóa tìm kiếm.'
                : 'Chưa có học viên nào ghi danh các khóa học của bạn.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9FC] border-b border-[#E4E4E0] text-[#5E5E5E] font-semibold">
                  <th className="py-3.5 px-6">Học viên</th>
                  <th className="py-3.5 px-6">Khóa học ghi danh</th>
                  <th className="py-3.5 px-6">Ngày ghi danh</th>
                  <th className="py-3.5 px-6">Tiến độ bài học</th>
                  <th className="py-3.5 px-6">Khảo thí Quiz</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E0] transition-opacity duration-200">
                {paginatedStudents.map((s) => {
                  const progressVal = Number(s.progressPercent || 0);
                  const enrolledDate = s.enrolledAt
                    ? new Date(s.enrolledAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })
                    : '--';

                  return (
                    <tr key={s.enrollmentId || s.userId} className="hover:bg-[#FAF9FC] transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img
                          src={getImageUrl(
                            s.avatarUrl,
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                          )}
                          alt={s.fullName || 'Học viên'}
                          className="w-9 h-9 rounded-full object-cover border border-[#E4E4E0] shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-[#1A1C1E]">{s.fullName || 'Học viên'}</p>
                          <p className="text-[11px] text-[#6B6B6B]">{s.email}</p>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-medium text-[#1A1C1E] max-w-xs">
                        <p className="line-clamp-1" title={s.courseTitle}>
                          {s.courseTitle}
                        </p>
                      </td>

                      <td className="py-4 px-6 text-[#5E5E5E] whitespace-nowrap">
                        {enrolledDate}
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1 w-36">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-[#16324F]">{progressVal}%</span>
                            {s.totalLessonsCount > 0 && (
                              <span className="text-[10px] text-[#5E5E5E]">
                                {s.completedLessonsCount || 0}/{s.totalLessonsCount} bài
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-[#E4E4E0] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#22C55E] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(0, progressVal))}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {s.quizScore !== null && s.quizScore !== undefined ? (
                          <span className="font-bold text-[#22C55E] flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> {s.quizScore}%
                          </span>
                        ) : s.isCompleted ? (
                          <span className="font-bold text-[#22C55E] flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> Đạt chứng chỉ
                          </span>
                        ) : (
                          <span className="text-[#6B6B6B]">Chưa thi</span>
                        )}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {s.isCompleted ? (
                          <span className="px-2.5 py-0.5 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#15803D] text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã tốt nghiệp
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Đang học
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Thanh phân trang client-side */}
            <Pagination
              currentPage={currentPage}
              totalItems={sortedStudents.length}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProgressPage;
