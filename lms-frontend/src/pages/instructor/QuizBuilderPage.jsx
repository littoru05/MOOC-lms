import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { quizApi } from '../../api/quizApi';
import { useTeachingCourses, useCourseQuizzes } from '../../hooks/useCourses';
import { useToast } from '../../context/ToastContext';
import { useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Save, 
  HelpCircle,
  BookOpen,
  AlertCircle
} from 'lucide-react';

export const QuizBuilderPage = ({ courseId: courseIdProp, onBack }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: teachingCourses = [], isLoading: loadingTeaching } = useTeachingCourses();

  const queryCourseId = searchParams.get('courseId');
  const courseId = courseIdProp || queryCourseId || (teachingCourses[0]?.id ? String(teachingCourses[0].id) : null);
  const currentCourse = teachingCourses.find((c) => String(c.id) === String(courseId));

  const { data: quizzes = [], isLoading: loadingQuizzes } = useCourseQuizzes(courseId);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/instructor/dashboard');
  };

  // Auto set courseId in query param if missing and teaching courses exist
  useEffect(() => {
    if (!queryCourseId && !courseIdProp && !loadingTeaching && teachingCourses.length > 0) {
      setSearchParams({ courseId: String(teachingCourses[0].id) }, { replace: true });
    }
  }, [queryCourseId, courseIdProp, loadingTeaching, teachingCourses, setSearchParams]);

  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState(80);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

  // Sync quiz data when quizzes query loads
  useEffect(() => {
    if (quizzes && quizzes.length > 0) {
      const existingQuiz = quizzes[0];
      setTitle(existingQuiz.title || `Bài kiểm tra Đánh giá: ${currentCourse?.title || ''}`);
      setPassingScore(existingQuiz.passingScore || 80);
      setDurationMinutes(existingQuiz.durationMinutes || 15);

      if (existingQuiz.questions && existingQuiz.questions.length > 0) {
        setQuestions(
          existingQuiz.questions.map((q) => ({
            questionText: q.questionText || q.content || '',
            point: q.point || 1,
            answers: (q.answers || q.options || []).map((a) => ({
              answerText: a.answerText || a.content || '',
              isCorrect: a.isCorrect === true || a.isCorrect === 1,
            })),
          }))
        );
      } else {
        setQuestions([]);
      }
    } else if (currentCourse) {
      // Default blank template for new quiz
      setTitle(`Bài kiểm tra Đánh giá Năng lực: ${currentCourse.title}`);
      setPassingScore(80);
      setDurationMinutes(15);
      setQuestions([]);
    }
  }, [quizzes, currentCourse]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        point: 1,
        answers: [
          { answerText: 'Lựa chọn A', isCorrect: true },
          { answerText: 'Lựa chọn B', isCorrect: false },
          { answerText: 'Lựa chọn C', isCorrect: false },
          { answerText: 'Lựa chọn D', isCorrect: false },
        ],
      },
    ]);
  };

  const handleDeleteQuestion = (qIdx) => {
    setQuestions(questions.filter((_, idx) => idx !== qIdx));
  };

  const handleQuestionTextChange = (qIdx, text) => {
    const updated = [...questions];
    updated[qIdx].questionText = text;
    setQuestions(updated);
  };

  const handleAnswerTextChange = (qIdx, aIdx, text) => {
    const updated = [...questions];
    updated[qIdx].answers[aIdx].answerText = text;
    setQuestions(updated);
  };

  const handleToggleCorrect = (qIdx, aIdx) => {
    const updated = [...questions];
    updated[qIdx].answers = updated[qIdx].answers.map((ans, idx) => ({
      ...ans,
      isCorrect: idx === aIdx,
    }));
    setQuestions(updated);
  };

  const handleSaveQuiz = async () => {
    if (!title.trim()) {
      showToast('Vui lòng nhập tiêu đề bài kiểm tra!', 'warning');
      return;
    }

    if (questions.length === 0) {
      showToast('Vui lòng thêm ít nhất 1 câu hỏi vào đề thi!', 'warning');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        showToast(`Câu hỏi số ${i + 1} chưa có nội dung câu hỏi!`, 'warning');
        return;
      }
      const hasCorrect = q.answers.some((a) => a.isCorrect);
      if (!hasCorrect) {
        showToast(`Câu hỏi số ${i + 1} chưa chọn đáp án đúng!`, 'warning');
        return;
      }
    }

    setSaving(true);
    try {
      await quizApi.createQuiz({
        courseId: Number(courseId),
        title: title.trim(),
        passingScore: Number(passingScore) || 80,
        durationMinutes: Number(durationMinutes) || 15,
        questions: questions.map((q) => ({
          questionText: q.questionText,
          point: q.point || 1,
          answers: q.answers.map((a) => ({
            answerText: a.answerText,
            isCorrect: a.isCorrect,
          })),
        })),
      });

      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });

      showToast('Đã lưu và xuất bản đề thi Quiz thành công!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi lưu đề thi Quiz!', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] py-8 px-6 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header & Course Switcher - ALWAYS VISIBLE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E0] pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-1.5 hover:bg-[#F4F3F6] rounded-md text-[#5E5E5E] cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold font-serif text-[#001D37]">
                Biên soạn Đề thi Khảo thí Trắc nghiệm (Quiz Builder)
              </h1>
              <p className="text-xs text-[#5E5E5E]">
                Cấu hình ngân hàng câu hỏi, điểm đạt và đáp án chính xác cho khóa học
              </p>
            </div>
          </div>

          {/* Right Controls: Course Selector Dropdown + Save Button */}
          <div className="flex items-center gap-3 flex-wrap">
            {teachingCourses.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-[#16324F] whitespace-nowrap">Đang chọn khóa học:</label>
                <select
                  value={courseId || ''}
                  onChange={(e) => setSearchParams({ courseId: e.target.value })}
                  className="px-3 py-2 text-xs font-semibold bg-white border border-[#E4E4E0] rounded-xl text-[#001D37] focus:outline-none focus:border-[#16324F] shadow-2xs cursor-pointer max-w-xs truncate"
                >
                  {teachingCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleSaveQuiz}
              disabled={saving || !courseId}
              className="px-5 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Đang lưu...' : 'Lưu & Xuất bản đề Quiz'}</span>
            </button>
          </div>
        </div>

        {/* Body Area */}
        {!loadingTeaching && teachingCourses.length === 0 ? (
          <div className="py-24 px-8 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-white border border-[#E4E4E0] rounded-2xl flex items-center justify-center mx-auto text-[#16324F] shadow-sm">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-serif text-[#001D37]">Bạn chưa có khóa học nào</h2>
            <p className="text-xs text-[#5E5E5E]">
              Vui lòng tạo khóa học trước khi tiến hành xây dựng ngân hàng đề thi trắc nghiệm.
            </p>
            <button
              onClick={() => navigate('/instructor/courses/create')}
              className="mt-3 px-5 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tạo khóa học mới ngay
            </button>
          </div>
        ) : courseId && loadingQuizzes ? (
          <div className="text-center py-20 text-xs text-[#6B6B6B]">Đang tải thông tin đề thi Quiz...</div>
        ) : (
          <>
            {/* General Quiz Config */}
            <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Tiêu đề bài kiểm tra</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Bài kiểm tra đánh giá năng lực cuối khóa"
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Điểm đạt yêu cầu (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Thời gian làm bài (phút)</label>
                <input
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
                />
              </div>
            </div>

            {/* Question List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#001D37]">
                  Danh sách câu hỏi ({questions.length})
                </h3>
                <button
                  onClick={handleAddQuestion}
                  className="px-3.5 py-1.5 bg-white border border-[#E4E4E0] hover:bg-[#F4F3F6] text-[#16324F] text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm câu hỏi mới
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="bg-white border border-dashed border-[#C3C6CE] rounded-xl p-10 text-center space-y-3">
                  <HelpCircle className="w-8 h-8 text-[#5E5E5E] mx-auto" />
                  <p className="text-xs font-semibold text-[#1A1C1E]">Chưa có câu hỏi nào trong đề thi này</p>
                  <p className="text-[11px] text-[#5E5E5E]">Bấm vào nút "Thêm câu hỏi mới" bên trên để bắt đầu soạn đề thi trắc nghiệm.</p>
                  <button
                    onClick={handleAddQuestion}
                    className="px-4 py-2 bg-[#16324F] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    Thêm câu hỏi đầu tiên
                  </button>
                </div>
              ) : (
                questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#16324F] bg-[#F4F3F6] px-2.5 py-1 rounded">
                        Câu hỏi {qIdx + 1}
                      </span>
                      <button
                        onClick={() => handleDeleteQuestion(qIdx)}
                        className="p-1 text-[#BA1A1A] hover:bg-[#FFDAD6] rounded cursor-pointer"
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Nội dung câu hỏi</label>
                      <textarea
                        rows={2}
                        value={q.questionText}
                        onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                        placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
                        className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
                      />
                    </div>

                    {/* Answers */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#5E5E5E]">Các phương án lựa chọn (Click hình tròn để chọn đáp án đúng):</label>
                      {q.answers.map((ans, aIdx) => (
                        <div key={aIdx} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleCorrect(qIdx, aIdx)}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              ans.isCorrect
                                ? 'border-[#22C55E] bg-[#22C55E] text-white'
                                : 'border-[#C3C6CE] bg-white hover:border-[#16324F]'
                            }`}
                            title="Đánh dấu đây là đáp án đúng"
                          >
                            {ans.isCorrect && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <input
                            type="text"
                            value={ans.answerText}
                            onChange={(e) => handleAnswerTextChange(qIdx, aIdx, e.target.value)}
                            placeholder={`Lựa chọn ${String.fromCharCode(65 + aIdx)}`}
                            className={`flex-1 px-3 py-2 text-xs border rounded-lg focus:outline-none ${
                              ans.isCorrect ? 'border-[#22C55E] bg-[#22C55E]/5 font-medium' : 'border-[#E4E4E0] bg-white'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
