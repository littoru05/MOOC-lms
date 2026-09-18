import React, { useState, useEffect } from 'react';
import { learningApi } from '../../api/learningApi';
import { courseApi } from '../../api/courseApi';
import { Users, BookOpen, CheckCircle2, Clock, Search, Award } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

export const StudentProgressPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample student progress data
  const [students, setStudents] = useState([
    {
      id: 1,
      fullName: 'Trần Văn Học Viên',
      email: 'student@lms.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      courseTitle: 'Lập trình Web Fullstack với Spring Boot & ReactJS',
      progressPercent: 100,
      isCompleted: true,
      quizScore: 100,
      enrolledAt: '2026-08-20',
    },
    {
      id: 2,
      fullName: 'Lê Thị Thu',
      email: 'thule@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      courseTitle: 'Lập trình Web Fullstack với Spring Boot & ReactJS',
      progressPercent: 60,
      isCompleted: false,
      quizScore: null,
      enrolledAt: '2026-08-21',
    },
    {
      id: 3,
      fullName: 'Phạm Minh Đức',
      email: 'ducpham@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      courseTitle: 'Khóa học Nhập môn Python & Machine Learning cơ bản',
      progressPercent: 40,
      isCompleted: false,
      quizScore: null,
      enrolledAt: '2026-08-22',
    }
  ]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseApi.getMyTeachingCourses();
        setCourses(res.data);
      } catch (err) {
        console.warn('Lỗi khi tải danh sách khóa học giảng viên:', err);
      }
    };
    fetchCourses();
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="py-10 px-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-[#16324F] uppercase tracking-wider">Theo dõi Học tập</span>
          <h1 className="text-2xl font-bold font-serif text-[#001D37] mt-1">
            Tiến độ & Kết quả Học viên
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-1">
            Theo dõi tỷ lệ hoàn thành bài học và kết quả khảo thí Quiz của các học viên ghi danh
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center bg-[#FAF9FC] border border-[#E4E4E0] rounded-lg px-3 py-2 w-72 focus-within:border-[#16324F] focus-within:bg-white">
          <Search className="w-3.5 h-3.5 text-[#6B6B6B] mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học viên, email..."
            className="w-full text-xs bg-transparent focus:outline-none text-[#1A1C1E]"
          />
        </div>
      </div>

      {/* Student Progress Table */}
      <div className="bg-white border border-[#E4E4E0] rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#E4E4E0] flex items-center justify-between">
          <h3 className="font-serif font-bold text-[#001D37] text-base">
            Danh sách học viên theo dõi ({filteredStudents.length})
          </h3>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF9FC] border-b border-[#E4E4E0] text-[#5E5E5E] font-semibold">
              <th className="py-3.5 px-6">Học viên</th>
              <th className="py-3.5 px-6">Khóa học ghi danh</th>
              <th className="py-3.5 px-6">Tiến độ hoàn thành</th>
              <th className="py-3.5 px-6">Điểm Quiz</th>
              <th className="py-3.5 px-6">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E4E0]">
            {filteredStudents.map((s) => (
              <tr key={s.id} className="hover:bg-[#FAF9FC] transition-colors">
                <td className="py-4 px-6 flex items-center gap-3">
                  <img
                    src={getImageUrl(s.avatarUrl, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150')}
                    alt={s.fullName}
                    className="w-9 h-9 rounded-full object-cover border border-[#E4E4E0]"
                  />
                  <div>
                    <p className="font-semibold text-[#1A1C1E]">{s.fullName}</p>
                    <p className="text-[11px] text-[#6B6B6B]">{s.email}</p>
                  </div>
                </td>

                <td className="py-4 px-6 font-medium text-[#1A1C1E]">
                  {s.courseTitle}
                </td>

                <td className="py-4 px-6">
                  <div className="space-y-1 w-36">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-[#16324F]">{s.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-[#E4E4E0] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#22C55E] h-full rounded-full"
                        style={{ width: `${s.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-6">
                  {s.quizScore !== null ? (
                    <span className="font-bold text-[#22C55E] flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> {s.quizScore}%
                    </span>
                  ) : (
                    <span className="text-[#6B6B6B]">Chưa thi</span>
                  )}
                </td>

                <td className="py-4 px-6">
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
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
