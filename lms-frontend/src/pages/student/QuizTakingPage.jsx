import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { quizApi } from '../../api/quizApi';
import { certificateApi } from '../../api/certificateApi';
import { useToast } from '../../context/ToastContext';
import { Clock, ArrowLeft, AlertTriangle, CheckCircle, HelpCircle, X } from 'lucide-react';

export const QuizTakingPage = ({ quizId: quizIdProp, enrollmentId: enrollmentIdProp, onBack, onCompleteQuiz }) => {
  const { quizId: paramQuizId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast() || {};

  const quizId = quizIdProp || paramQuizId || 1;
  const enrollmentId = enrollmentIdProp || searchParams.get('enrollmentId');

  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins default
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Nút Back trong giao diện: Mở modal xác nhận trên màn hình
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    setShowLeaveModal(true);
  };

  const executeLeave = () => {
    setShowLeaveModal(false);
    if (quiz?.courseId) {
      navigate(`/learn/${quiz.courseId}`, { replace: true });
    } else {
      navigate('/my-learning', { replace: true });
    }
  };

  const handleComplete = (resultData) => {
    if (onCompleteQuiz) {
      onCompleteQuiz(resultData);
    } else {
      navigate(`/quiz/${quizId}/result${enrollmentId ? `?enrollmentId=${enrollmentId}` : ''}`, {
        replace: true,
        state: { result: resultData, enrollmentId }
      });
    }
  };

  // 1. Kiểm tra nếu học viên ĐÃ ĐẠT quiz (đã có chứng chỉ), chuyển thẳng sang Result
  useEffect(() => {
    if (!enrollmentId) return;
    let isMounted = true;
    certificateApi.getCertificateByEnrollment(enrollmentId)
      .then((res) => {
        if (isMounted && res.data && res.data.certificateCode) {
          navigate(`/quiz/${quizId}/result?enrollmentId=${enrollmentId}`, {
            replace: true,
            state: {
              result: {
                passed: true,
                score: res.data.finalScore || 100,
                totalScore: 100,
                passingScore: 80,
                message: 'Bạn đã hoàn thành và đạt bài kiểm tra này.',
                certificate: res.data,
                courseId: quiz?.courseId,
              },
              enrollmentId
            }
          });
        }
      })
      .catch(() => {
        // Chưa có chứng chỉ (chưa đạt hoặc chưa thi) -> Cho phép làm bài như hiện tại
      });
    return () => {
      isMounted = false;
    };
  }, [enrollmentId, quizId, navigate, quiz?.courseId]);

  // 2. Tải thông tin đề thi Quiz
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

  // 3. Xử lý nút Back trình duyệt khi ĐANG làm bài (popstate)
  useEffect(() => {
    if (submitting) return;

    window.history.pushState({ inQuiz: true }, '');

    const handlePopState = () => {
      if (submitting) return;
      setShowLeaveModal(true);
      window.history.pushState({ inQuiz: true }, '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [quiz?.courseId, submitting, navigate]);

  // 4. Đồng hồ đếm ngược - Dừng và dọn dẹp khi rời trang
  useEffect(() => {
    if (timeLeft <= 0 || submitting) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitting]);

  const handleSelectAnswer = (questionId, answerId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  // Bấm nộp bài: Mở thẻ xác nhận trên màn hình (không dùng toast trùng lặp)
  const handleSubmit = () => {
    if (!quiz) return;
    setShowSubmitModal(true);
  };

  // Thực hiện nộp bài sau khi người dùng bấm xác nhận trong ô Modal
  const executeSubmit = async () => {
    setShowSubmitModal(false);
    if (!quiz) return;

    const studentAnswers = Object.entries(selectedAnswers).map(([qId, aId]) => ({
      questionId: Number(qId),
      selectedAnswerId: Number(aId),
    }));

    setSubmitting(true);
    try {
      const res = await quizApi.submitQuiz(quizId, {
        enrollmentId: enrollmentId ? Number(enrollmentId) : null,
        studentAnswers,
      });
      handleComplete({
        ...res.data,
        courseId: quiz.courseId
      });
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        (err.response?.data?.details && Object.values(err.response.data.details).join(', ')) ||
        err.response?.data?.error ||
        'Lỗi khi nộp bài thi!';
      if (showToast) {
        showToast(errMsg, 'error');
      }
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
            aria-label="Quay lại bài học"
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
                    className={`w-full p-3.5 rounded-lg border text-left text-xs transition-all flex items-center gap-3 cursor-pointer ${
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
            className="px-8 py-3 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Đang chấm điểm...' : 'Hoàn tất & Nộp bài kiểm tra'}
          </button>
        </div>

      </div>

      {/* Modal xác nhận nộp bài thi ngay trên màn hình */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E4E4E0] space-y-5 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl shrink-0 ${
                answeredCount === 0
                  ? 'bg-rose-50 text-rose-600'
                  : answeredCount < totalQuestions
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}>
                {answeredCount < totalQuestions ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#1A1C1E]">
                  Xác nhận nộp bài thi
                </h3>
                <p className="text-xs text-[#5E5E5E] mt-1.5 leading-relaxed">
                  {answeredCount === 0 ? (
                    <>Bạn <span className="font-semibold text-rose-600">chưa chọn bất kỳ câu trả lời nào</span>. Nếu nộp bài ngay bây giờ, bạn sẽ nhận 0 điểm và không vượt qua bài kiểm tra.</>
                  ) : answeredCount < totalQuestions ? (
                    <>Bạn mới trả lời <span className="font-semibold text-amber-700">{answeredCount}/{totalQuestions}</span> câu hỏi. Các câu hỏi chưa chọn đáp án sẽ không được tính điểm.</>
                  ) : (
                    <>Bạn đã hoàn thành <span className="font-semibold text-emerald-700">{totalQuestions}/{totalQuestions}</span> câu hỏi. Bạn có chắc chắn muốn nộp bài để hệ thống chấm điểm không?</>
                  )}
                </p>
              </div>
            </div>

            {/* Thông tin tóm tắt số lượng câu */}
            <div className="bg-[#FAF9FC] p-3.5 rounded-xl border border-[#E4E4E0] flex items-center justify-between text-xs">
              <span className="text-[#5E5E5E]">Tiến độ bài làm:</span>
              <span className="font-bold text-[#16324F]">
                {answeredCount} / {totalQuestions} câu hỏi
              </span>
            </div>

            {/* Nút hành động */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E4E4E0] text-xs font-semibold text-[#5E5E5E] hover:bg-[#FAF9FC] hover:text-[#1A1C1E] transition-colors cursor-pointer"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                onClick={executeSubmit}
                disabled={submitting}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  answeredCount === 0
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#16324F] hover:bg-[#001D37]'
                }`}
              >
                {submitting ? 'Đang gửi...' : 'Xác nhận nộp bài'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận rời khỏi bài thi */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E4E4E0] space-y-4 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1C1E]">
                  Rời khỏi bài thi?
                </h3>
                <p className="text-xs text-[#5E5E5E] mt-1 leading-relaxed">
                  Tiến trình làm bài hiện tại của bạn sẽ không được lưu nếu bạn rời khỏi trang ngay bây giờ.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="px-3.5 py-2 rounded-xl border border-[#E4E4E0] text-xs font-semibold text-[#5E5E5E] hover:bg-[#FAF9FC] hover:text-[#1A1C1E] transition-colors cursor-pointer"
              >
                Ở lại làm tiếp
              </button>
              <button
                type="button"
                onClick={executeLeave}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors cursor-pointer"
              >
                Rời khỏi bài thi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
