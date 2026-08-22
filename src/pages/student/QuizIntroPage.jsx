import React, { useState, useEffect } from 'react';
import { quizApi } from '../../api/quizApi';
import { getAllQuizzes, getCourseBySlugOrId } from '../../mocks/courses';
import { 
  HelpCircle, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Play, 
  ShieldCheck, 
  BookOpen, 
  Sparkles,
  Check
} from 'lucide-react';

export const QuizIntroPage = ({ quizId, enrollmentId, onConfirmStart, onCancel }) => {
  const [quiz, setQuiz] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const all = getAllQuizzes();
        let currentQuiz = all.find((q) => Number(q.id) === Number(quizId)) || all[0];

        try {
          const res = await quizApi.getQuizById(quizId);
          if (res.data) {
            currentQuiz = { ...currentQuiz, ...res.data };
          }
        } catch (e) {
          // fallback
        }

        setQuiz(currentQuiz);

        if (currentQuiz?.courseId) {
          const courseData = getCourseBySlugOrId(currentQuiz.courseId);
          setCourse(courseData);
        }
      } catch (err) {
        console.error('Lỗi khi tải thông tin bài thi:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-[#FAF9FC]">
        <div className="w-8 h-8 border-3 border-[#16324F] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[#5E5E5E]">Đang chuẩn bị đề thi và phòng khảo thí trực tuyến...</p>
      </div>
    );
  }

  const totalQuestions = quiz?.questions?.length || quiz?.questionsCount || 5;
  const passScore = quiz?.passScore || quiz?.passingScore || 80;
  const duration = quiz?.durationMinutes || 15;

  return (
    <div className="min-h-screen bg-[#FAF9FC] py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* Back navigation */}
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5E5E5E] hover:text-[#001D37] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại bài học</span>
        </button>

        {/* Hero Card */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E0] pb-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#16324F] uppercase tracking-wider bg-[#F4F3F6] px-2.5 py-1 rounded-md inline-block">
                Hệ thống Khảo thí Đánh giá Năng lực
              </span>
              <h1 className="text-2xl font-bold font-serif text-[#001D37] pt-1">
                {quiz?.title || 'Bài kiểm tra Đánh giá Năng lực Cuối khóa'}
              </h1>
              {course && (
                <p className="text-xs font-medium text-[#5E5E5E] flex items-center gap-1.5 pt-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#16324F]" />
                  <span>Khóa học: <strong>{course.title}</strong></span>
                </p>
              )}
            </div>

            <div className="w-14 h-14 bg-[#16324F]/5 text-[#16324F] border border-[#16324F]/20 rounded-2xl flex items-center justify-center shrink-0">
              <HelpCircle className="w-7 h-7 text-[#16324F]" />
            </div>
          </div>

          {/* Key Parameters Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl p-4.5 space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#5E5E5E] font-semibold">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Thời gian làm bài</span>
              </div>
              <p className="text-xl font-bold font-serif text-[#001D37] pt-1">{duration} Phút</p>
              <p className="text-[10px] text-[#5E5E5E]">Đồng hồ đếm ngược tự động nộp</p>
            </div>

            <div className="bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl p-4.5 space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#5E5E5E] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Điểm đạt tối thiểu</span>
              </div>
              <p className="text-xl font-bold font-serif text-[#001D37] pt-1">{passScore}%</p>
              <p className="text-[10px] text-[#5E5E5E]">Đạt điều kiện cấp chứng chỉ số</p>
            </div>

            <div className="bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl p-4.5 space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#5E5E5E] font-semibold">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Tổng số câu hỏi</span>
              </div>
              <p className="text-xl font-bold font-serif text-[#001D37] pt-1">{totalQuestions} Câu</p>
              <p className="text-[10px] text-[#5E5E5E]">Trắc nghiệm chọn 1 đáp án đúng</p>
            </div>
          </div>

          {/* Rules & Guidelines */}
          <div className="bg-amber-50/50 border border-amber-200/70 rounded-xl p-5 space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#001D37] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Quy chế thi & Hướng dẫn làm bài quan trọng</span>
            </h3>
            <ul className="text-xs text-[#5E5E5E] space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Thời gian làm bài sẽ bắt đầu đếm ngược ngay khi bạn bấm nút <strong>"Bắt đầu làm bài thi ngay"</strong> bên dưới.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Không đóng trình duyệt hoặc tải lại trang trong quá trình thi để tránh mất tiến trình trả lời.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Khi đạt từ <strong>{passScore}%</strong> trở lên, bạn sẽ được hệ thống chứng thực và cấp <strong>Chứng chỉ Tốt nghiệp UUID</strong> ngay lập tức.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Nếu chưa đạt điểm yêu cầu, bạn có thể xem lại đáp án chi tiết và làm lại bài thi bất kỳ lúc nào.</span>
              </li>
            </ul>
          </div>

          {/* Action Confirmation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E4E4E0]">
            <button
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-2.5 border border-[#E4E4E0] hover:bg-[#FAF9FC] text-[#5E5E5E] text-xs font-semibold rounded-xl transition-colors"
            >
              Quay lại ôn tập thêm
            </button>

            <button
              onClick={() => onConfirmStart(quiz.id, enrollmentId)}
              className="w-full sm:w-auto px-8 py-3 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:gap-3"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Bắt đầu làm bài thi ngay ({duration} phút)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
