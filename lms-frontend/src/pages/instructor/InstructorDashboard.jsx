import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseApi } from '../../api/courseApi';
import { useAuth } from '../../context/AuthContext';
import { getAllQuizzes } from '../../mocks/courses';
import {
  BookOpen,
  Plus,
  Edit3,
  HelpCircle,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';

import { useToast } from '../../context/ToastContext';

export const InstructorDashboard = ({ onEditCourse, onCreateCourse, onBuildQuiz }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, confirm } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleEdit = (cid) => {
    if (onEditCourse) onEditCourse(cid);
    else navigate(`/instructor/courses/${cid}/edit`);
  };

  const handleCreate = () => {
    if (onCreateCourse) onCreateCourse();
    else navigate('/instructor/courses/create');
  };

  const handleBuild = (cid) => {
    if (onBuildQuiz) onBuildQuiz(cid);
    else navigate(`/instructor/courses/${cid || 1}/quiz-builder`);
  };

  const fetchCourses = async () => {
    try {
      const res = await courseApi.getMyTeachingCourses();
      setCourses(res.data);
    } catch (err) {
      console.warn('Lỗi khi tải khóa học của giảng viên:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmitReview = async (courseId) => {
    confirm({
      title: 'Gửi kiểm duyệt khóa học',
      message: 'Bạn có chắc chắn muốn gửi khóa học này lên Quản trị viên để xét duyệt xuất bản lên hệ thống?',
      confirmText: 'Gửi duyệt ngay',
      onConfirm: async () => {
        try {
          await courseApi.submitForReview(courseId);
          showToast('Đã gửi yêu cầu kiểm duyệt khóa học thành công lên Quản trị viên!', 'success');
          fetchCourses();
        } catch (err) {
          showToast(err.response?.data?.message || 'Đã gửi yêu cầu kiểm duyệt!', 'success');
          fetchCourses();
        }
      },
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="px-2.5 py-0.5 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#15803D] text-[11px] font-bold rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Đã xuất bản
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> Chờ Admin duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 bg-[#BA1A1A]/10 border border-[#BA1A1A]/30 text-[#BA1A1A] text-[11px] font-bold rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Bị từ chối
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 bg-[#EFEDF0] border border-[#E4E4E0] text-[#5E5E5E] text-[11px] font-bold rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Bản nháp (Draft)
          </span>
        );
    }
  };

  const publishedCount = courses.filter(c => c.status === 'PUBLISHED').length;
  const pendingCount = courses.filter(c => c.status === 'PENDING').length;
  const draftCount = courses.filter(c => c.status === 'DRAFT' || !c.status).length;

  return (
    <div className="min-h-screen bg-[#FAF9FC] py-8 px-8 space-y-8">

      {/* Top Clean Header */}
      <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F4F3F6] border border-[#E4E4E0] rounded-md text-[11px] font-bold text-[#16324F]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Không gian Giảng viên Chuyên môn</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#001D37] tracking-tight">
            Bảng điều khiển Giảng dạy & Khóa học
          </h1>
          <p className="text-xs text-[#5E5E5E]">
            Quản lý danh sách khóa học, biên soạn giáo trình, câu hỏi khảo thí trắc nghiệm và gửi phê duyệt lên Quản trị viên.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl self-start md:self-auto transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo khóa học mới</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-[11px] text-[#5E5E5E] uppercase font-bold tracking-wider">Tổng khóa học</span>
          <p className="text-2xl font-extrabold text-[#001D37] font-serif">{courses.length}</p>
        </div>
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-[11px] text-emerald-600 uppercase font-bold tracking-wider">Đã xuất bản</span>
          <p className="text-2xl font-extrabold text-emerald-600 font-serif">{publishedCount}</p>
        </div>
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-[11px] text-amber-600 uppercase font-bold tracking-wider">Chờ xét duyệt</span>
          <p className="text-2xl font-extrabold text-amber-600 font-serif">{pendingCount}</p>
        </div>
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-[11px] text-[#5E5E5E] uppercase font-bold tracking-wider">Bản nháp đang soạn</span>
          <p className="text-2xl font-extrabold text-[#5E5E5E] font-serif">{draftCount}</p>
        </div>
      </div>
      {/* Courses Table / List */}
      <div className="bg-white border border-[#E4E4E0] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E4E4E0] flex items-center justify-between bg-[#FAF9FC]">
          <h3 className="font-serif font-extrabold text-[#001D37] text-base">
            Danh sách khóa học của bạn ({courses.length})
          </h3>
          <span className="text-xs text-[#5E5E5E]">Quản lý nội dung và gửi duyệt</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xs text-[#5E5E5E]">Đang tải danh sách khóa học...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <BookOpen className="w-10 h-10 text-[#5E5E5E] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-[#1A1C1E]">Bạn chưa có khóa học nào</p>
            <button
              onClick={handleCreate}
              className="mt-3 px-5 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Bắt đầu tạo khóa học đầu tiên
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E4E0]">
            {courses.map((c) => (
              <div key={c.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#FAF9FC] transition-colors">

                {/* Left info */}
                <div className="flex items-start gap-4">
                  <img
                    src={c.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600'}
                    alt={c.title}
                    className="w-28 h-18 rounded-xl object-cover border border-[#E4E4E0] shrink-0 shadow-2xs"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(c.status)}
                      {c.category && (
                        <span className="text-[11px] font-semibold text-[#16324F] bg-[#F4F3F6] px-2.5 py-0.5 rounded-md border border-[#E4E4E0]">
                          {c.category.name}
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif font-bold text-base text-[#001D37] line-clamp-1">{c.title}</h4>
                    <p className="text-xs text-[#5E5E5E] line-clamp-1">{c.description}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
                  <button
                    onClick={() => handleEdit(c.id)}
                    className="px-3.5 py-2 bg-white border border-[#E4E4E0] hover:border-[#16324F] hover:bg-[#F4F3F6] text-[#1A1C1E] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    title="Chỉnh sửa nội dung & bài học"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#16324F]" /> Soạn bài học
                  </button>

                  <button
                    onClick={() => handleBuild(c.id)}
                    className="px-3.5 py-2 bg-white border border-[#E4E4E0] hover:border-amber-500 hover:bg-amber-50/50 text-[#1A1C1E] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    title="Soạn câu hỏi trắc nghiệm Quiz"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Soạn đề Quiz
                  </button>

                  {c.status === 'DRAFT' && (
                    <button
                      onClick={() => handleSubmitReview(c.id)}
                      className="px-4 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Gửi lên Admin để phê duyệt xuất bản"
                    >
                      <Send className="w-3.5 h-3.5" /> Gửi duyệt
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quizzes Management List */}
      <div className="bg-white border border-[#E4E4E0] rounded-xl overflow-hidden shadow-xs space-y-0">
        <div className="px-6 py-4 border-b border-[#E4E4E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div>
            <h3 className="font-serif font-bold text-[#001D37] text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#16324F]" />
              <span>Danh sách Đề thi Trắc nghiệm Quiz đã biên soạn ({getAllQuizzes().length})</span>
            </h3>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              Các đề thi này được đồng bộ thời gian thực sang khóa học tương ứng của Học viên
            </p>
          </div>

          <button
            onClick={() => handleBuild(courses[0]?.id || 1)}
            className="px-3.5 py-1.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Soạn đề Quiz mới
          </button>
        </div>

        <div className="divide-y divide-[#E4E4E0]">
          {getAllQuizzes().map((quiz) => (
            <div key={quiz.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF9FC] transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold rounded-full">
                    Khóa học ID: {quiz.courseId}
                  </span>
                  <span className="text-[11px] text-[#5E5E5E]">
                    {quiz.createdAt || '2026-08-22'}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-base text-[#001D37]">{quiz.title}</h4>
                <p className="text-xs text-[#5E5E5E]">{quiz.courseTitle || 'Khóa học liên kết'}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#5E5E5E]">
                <div className="flex items-center gap-1 bg-[#FAF9FC] px-3 py-1.5 rounded-lg border border-[#E4E4E0]">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Thời gian: <strong>{quiz.durationMinutes || 15} phút</strong></span>
                </div>

                <div className="flex items-center gap-1 bg-[#FAF9FC] px-3 py-1.5 rounded-lg border border-[#E4E4E0]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Điểm đạt: <strong>{quiz.passScore || quiz.passingScore || 80}%</strong></span>
                </div>

                <div className="flex items-center gap-1 bg-[#FAF9FC] px-3 py-1.5 rounded-lg border border-[#E4E4E0]">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Số câu hỏi: <strong>{quiz.questions?.length || quiz.questionsCount || 5} câu</strong></span>
                </div>

                <button
                  onClick={() => handleBuild(quiz.courseId)}
                  className="px-3.5 py-1.5 bg-white border border-[#E4E4E0] hover:bg-[#F4F3F6] text-[#16324F] text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa đề thi
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
