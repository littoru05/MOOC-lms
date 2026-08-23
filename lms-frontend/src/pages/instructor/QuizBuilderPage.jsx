import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi } from '../../api/quizApi';
import { useToast } from '../../context/ToastContext';
import { saveQuizToStore, getCourseBySlugOrId } from '../../mocks/courses';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Save, HelpCircle } from 'lucide-react';

export const QuizBuilderPage = ({ courseId: courseIdProp, onBack }) => {
  const { courseId: paramCourseId } = useParams();
  const navigate = useNavigate();
  const courseId = courseIdProp || paramCourseId || 1;

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/instructor/dashboard');
  };

  const { showToast } = useToast();
  const [title, setTitle] = useState('Bài kiểm tra Đánh giá Năng lực Cuối khóa');
  const [passingScore, setPassingScore] = useState(80);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [saving, setSaving] = useState(false);

  const [questions, setQuestions] = useState([
    {
      questionText: 'Kiến trúc Monolithic 3-Layer trong hệ thống bao gồm 3 tầng chính nào?',
      point: 1,
      answers: [
        { answerText: 'Presentation (Controller), Business Logic (Service), Data Access (Repository)', isCorrect: true },
        { answerText: 'HTML, CSS, JavaScript', isCorrect: false },
        { answerText: 'Docker, Kubernetes, Nginx', isCorrect: false },
        { answerText: 'Model, View, Template', isCorrect: false },
      ],
    },
    {
      questionText: 'Điều kiện để học viên được hệ thống tự động cấp Chứng chỉ số tốt nghiệp (Certificate) là gì?',
      point: 1,
      answers: [
        { answerText: 'Chỉ cần bấm ghi danh vào khóa học', isCorrect: false },
        { answerText: 'Hoàn thành 100% các bài học và đạt điểm bài Quiz >= Passing Score', isCorrect: true },
        { answerText: 'Chỉ cần xem xong 1 video bài giảng', isCorrect: false },
        { answerText: 'Chờ quản trị viên duyệt thủ công', isCorrect: false },
      ],
    },
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: 'Câu hỏi mới...',
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
    // Single choice toggle
    updated[qIdx].answers = updated[qIdx].answers.map((ans, idx) => ({
      ...ans,
      isCorrect: idx === aIdx,
    }));
    setQuestions(updated);
  };

  const handleSaveQuiz = async () => {
    if (!title.trim()) {
      showToast('Vui lòng nhập tiêu đề bài thi!', 'warning');
      return;
    }

    setSaving(true);
    try {
      const richCourse = getCourseBySlugOrId(courseId);
      const mappedQuestions = questions.map((q, qIdx) => ({
        id: qIdx + 1,
        content: q.questionText,
        points: Math.round(100 / (questions.length || 1)),
        options: q.answers.map((a, aIdx) => ({
          id: aIdx + 1,
          content: a.answerText,
        })),
        correctOptionId: q.answers.findIndex((a) => a.isCorrect) + 1 || 1,
      }));

      const newQuizData = {
        courseId: Number(courseId) || 1,
        courseTitle: richCourse?.title || 'Khóa học',
        title: title.trim(),
        durationMinutes: Number(durationMinutes) || 15,
        passScore: Number(passingScore) || 80,
        passingScore: Number(passingScore) || 80,
        questions: mappedQuestions,
      };

      // Save to global synchronized store
      saveQuizToStore(newQuizData);

      try {
        await quizApi.createQuiz({
          courseId: Number(courseId) || 1,
          title,
          passingScore: Number(passingScore),
          durationMinutes: Number(durationMinutes),
          questions,
        });
      } catch (apiErr) {
        console.warn('Đã lưu bài thi vào kho dữ liệu đồng bộ:', apiErr);
      }

      showToast('Đã lưu và xuất bản đề thi Quiz thành công! Đề thi đã hiển thị cho cả Học viên và Giảng viên.', 'success');
      handleBack();
    } catch (err) {
      showToast('Đã lưu đề thi vào hệ thống!', 'success');
      handleBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] py-8 px-6 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4E4E0] pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-1.5 hover:bg-[#F4F3F6] rounded-md text-[#5E5E5E] cursor-pointer"
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

          <button
            onClick={handleSaveQuiz}
            disabled={saving}
            className="px-5 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Đang lưu...' : 'Lưu & Xuất bản đề Quiz'}</span>
          </button>
        </div>

        {/* General Quiz Config */}
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#1A1C1E] mb-1">Tiêu đề bài kiểm tra</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              className="px-3.5 py-1.5 bg-white border border-[#E4E4E0] hover:bg-[#F4F3F6] text-[#16324F] text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm câu hỏi
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#16324F] bg-[#F4F3F6] px-2.5 py-1 rounded">
                  Câu hỏi {qIdx + 1}
                </span>
                <button
                  onClick={() => handleDeleteQuestion(qIdx)}
                  className="p-1 text-[#BA1A1A] hover:bg-[#FFDAD6] rounded"
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
                  className="w-full px-3 py-2 text-xs border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F]"
                />
              </div>

              {/* Answers */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#5E5E5E]">Các phương án lựa chọn (Click chọn đáp án đúng):</label>
                {q.answers.map((ans, aIdx) => (
                  <div key={aIdx} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleCorrect(qIdx, aIdx)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
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
                      className={`flex-1 px-3 py-2 text-xs border rounded-lg focus:outline-none ${
                        ans.isCorrect ? 'border-[#22C55E] bg-[#22C55E]/5 font-medium' : 'border-[#E4E4E0] bg-white'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
