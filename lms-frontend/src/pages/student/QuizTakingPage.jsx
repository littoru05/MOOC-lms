import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { quizApi } from '../../api/quizApi';
import { Clock, HelpCircle, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const QuizTakingPage = ({ quizId: quizIdProp, enrollmentId: enrollmentIdProp, onBack, onCompleteQuiz }) => {
  const { quizId: paramQuizId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const quizId = quizIdProp || paramQuizId || 1;
  const enrollmentId = enrollmentIdProp || searchParams.get('enrollmentId');

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(`/quiz/${quizId}`);
  };

  const handleComplete = (resultData) => {
    if (onCompleteQuiz) {
      onCompleteQuiz(resultData);
    } else {
      navigate(`/quiz/${quizId}/result`, { state: { result: resultData } });
    }
  };
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins default
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizApi.getQuizById(quizId);
        setQuiz(res.data);
        if (res.data?.durationMinutes) {
          setTimeLeft(res.data.durationMinutes * 60);
        }
      } catch (err) {
        console.warn('Lỗi khi tải bài quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelectAnswer = (questionId, answerId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const studentAnswers = Object.entries(selectedAnswers).map(([qId, aId]) => ({
      questionId: Number(qId),
      selectedAnswerId: Number(aId),
    }));

    if (studentAnswers.length < (quiz.questions?.length || 0)) {
      if (!window.confirm('Bạn vẫn chưa trả lời hết các câu hỏi. Bạn có chắc chắn muốn nộp bài ngay không?')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await quizApi.submitQuiz(quizId, {
        enrollmentId,
        studentAnswers,
      });
      handleComplete(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi nộp bài thi!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-32 text-xs text-[#6B6B6B]">Đang tải đề thi trắc nghiệm...</div>;
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-sm font-semibold text-[#1A1C1E]">Không tìm thấy thông tin bài thi</p>
        <button onClick={handleBack} className="mt-4 px-4 py-2 text-xs bg-[#16324F] text-white rounded-lg cursor-pointer">
          Quay lại
        </button>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = quiz.questions?.length || 0;

  return (
    <div className="min-h-screen bg-[#FAF9FC] pb-20">
      
      {/* Top Fixed Exam Banner */}
      <header className="bg-white border-b border-[#E4E4E0] sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 hover:bg-[#F4F3F6] rounded text-[#5E5E5E] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-bold font-serif text-[#001D37]">{quiz.title}</h1>
            <p className="text-[11px] text-[#5E5E5E]">
              Điểm đạt: {quiz.passingScore}% • Đã làm: {answeredCount}/{totalQuestions} câu
            </p>
          </div>
        </div>

        {/* Timer & Submit */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9FC] border border-[#E4E4E0] rounded-lg text-xs font-semibold text-[#16324F]">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            {submitting ? 'Đang chấm điểm...' : 'Nộp bài thi'}
          </button>
        </div>
      </header>

      {/* Questions Container */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {quiz.questions?.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#16324F] text-white text-xs font-bold flex items-center justify-center font-serif">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-[#5E5E5E] uppercase tracking-wider">
                  Câu hỏi {idx + 1} ({q.point || 1} điểm)
                </span>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-[#1A1C1E] mb-5 leading-relaxed">
              {q.questionText}
            </h3>

            {/* Answer Options */}
            <div className="space-y-2.5">
              {q.answers?.map((ans) => {
                const isSelected = selectedAnswers[q.id] === ans.id;
                return (
                  <button
                    key={ans.id}
                    type="button"
                    onClick={() => handleSelectAnswer(q.id, ans.id)}
                    className={`w-full p-3.5 rounded-lg border text-left text-xs transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-[#16324F] bg-[#F4F3F6] text-[#001D37] font-medium'
                        : 'border-[#E4E4E0] hover:bg-[#FAF9FC] text-[#1A1C1E]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-[#16324F] bg-[#16324F]'
                          : 'border-[#C3C6CE] bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span>{ans.answerText}</span>
                  </button>
                );
              })}
            </div>

          </div>
        ))}

        {/* Bottom Submit Action */}
        <div className="pt-4 text-center">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Đang chấm điểm...' : 'Hoàn tất & Nộp bài kiểm tra'}
          </button>
        </div>

      </div>

    </div>
  );
};
