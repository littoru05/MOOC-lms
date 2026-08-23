import React, { useState, useEffect } from 'react';
import { courseApi } from '../../api/courseApi';
import { learningApi } from '../../api/learningApi';
import { quizApi } from '../../api/quizApi';
import { getCourseBySlugOrId, getQuizzesByCourseId } from '../../mocks/courses';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle, 
  Circle, 
  Play, 
  FileText, 
  Video, 
  Clock, 
  Award, 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Sparkles
} from 'lucide-react';

export const CoursePlayerPage = ({ courseId, onBack, onStartQuiz, onViewCertificate }) => {
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [activeLesson, setActiveLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const richCourse = getCourseBySlugOrId(courseId);
        setCourse(richCourse);

        // Fallback sections from rich course
        let availableSections = richCourse?.sections || [];

        // Try fetching live backend sections and intelligently merge lessons
        try {
          const secRes = await courseApi.getSectionsByCourse(courseId);
          if (secRes.data && secRes.data.length > 0) {
            const merged = secRes.data.map((apiSec, idx) => {
              const matchMockSec = richCourse?.sections?.find(
                (ms) => ms.id === apiSec.id || ms.orderIndex === apiSec.orderIndex || String(ms.title).trim() === String(apiSec.title).trim()
              ) || richCourse?.sections?.[idx];

              return {
                ...apiSec,
                lessons: (apiSec.lessons && apiSec.lessons.length > 0)
                  ? apiSec.lessons
                  : (matchMockSec?.lessons || [])
              };
            });

            // If backend sections did not retain lessons, keep richCourse.sections
            const mergedLessonsCount = merged.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
            if (mergedLessonsCount > 0) {
              availableSections = merged;
            } else if (richCourse?.sections && richCourse.sections.length > 0) {
              availableSections = richCourse.sections;
            }
          }
        } catch (e) {
          console.warn('Dùng dữ liệu đề cương bài giảng tiêu chuẩn từ Mock Data:', e);
        }

        setSections(availableSections);

        // Compute all available lessons from sections
        const flattenedLessons = availableSections.flatMap((s) => s.lessons || []);

        // Try fetching enrollments & progress
        let initialCompletedSet = new Set();
        try {
          const myEnrollmentsRes = await learningApi.getMyEnrollments();
          if (myEnrollmentsRes.data) {
            const currentEnrollment = myEnrollmentsRes.data.find(
              (e) => e.courseId === Number(courseId) || e.course?.id === Number(courseId)
            );
            if (currentEnrollment) {
              setEnrollment(currentEnrollment);
              
              const progRes = await learningApi.getProgress(currentEnrollment.id);
              if (progRes.data && progRes.data.length > 0) {
                const dbCompleted = new Set(
                  progRes.data.filter((p) => p.isCompleted).map((p) => p.lessonId)
                );
                initialCompletedSet = dbCompleted;
                setCompletedLessonIds(dbCompleted);
              }

              if (currentEnrollment.progressPercent !== undefined && currentEnrollment.progressPercent !== null) {
                setProgressPercent(Number(currentEnrollment.progressPercent));
              } else if (flattenedLessons.length > 0) {
                const calc = Math.round((initialCompletedSet.size / flattenedLessons.length) * 100);
                setProgressPercent(calc);
              }
            }
          }
        } catch (e) {
          console.warn('Chưa có enrollment backend, tính tiến độ cục bộ');
        }

        // Load quizzes from store & backend
        const storeQuizzes = getQuizzesByCourseId(courseId);
        try {
          const quizRes = await quizApi.getQuizzesByCourse(courseId);
          if (quizRes.data && quizRes.data.length > 0) {
            setQuizzes(quizRes.data);
          } else {
            setQuizzes(storeQuizzes);
          }
        } catch (e) {
          setQuizzes(storeQuizzes);
        }

        // Auto select first lesson if available
        if (flattenedLessons.length > 0) {
          setActiveLesson(flattenedLessons[0]);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu bài học:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [courseId]);

  const allLessons = sections.flatMap((s) => s.lessons || []);
  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l) => completedLessonIds.has(l.id)).length;

  const handleCompleteLesson = async () => {
    if (!activeLesson?.id) return;

    setCompleting(true);
    try {
      const newCompleted = new Set([...completedLessonIds, activeLesson.id]);
      setCompletedLessonIds(newCompleted);

      if (enrollment?.id) {
        const res = await learningApi.completeLesson(enrollment.id, activeLesson.id);
        if (res.data?.progressPercent !== undefined) {
          setProgressPercent(Number(res.data.progressPercent));
        } else if (totalLessons > 0) {
          setProgressPercent(Math.round((newCompleted.size / totalLessons) * 100));
        }
      } else {
        const calc = totalLessons > 0 ? Math.round((newCompleted.size / totalLessons) * 100) : 100;
        setProgressPercent(calc);
      }
    } catch (err) {
      const newCompleted = new Set([...completedLessonIds, activeLesson.id]);
      setCompletedLessonIds(newCompleted);
      const calc = totalLessons > 0 ? Math.round((newCompleted.size / totalLessons) * 100) : 100;
      setProgressPercent(calc);
    } finally {
      setCompleting(false);
    }
  };

  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isCurrentCompleted = activeLesson ? completedLessonIds.has(activeLesson.id) : false;

  const isYouTubeUrl = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  if (loading) {
    return <div className="text-center py-32 text-xs text-[#6B6B6B]">Đang tải trình phát bài giảng...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAF9FC] flex flex-col">
      
      {/* Top Learning Navigation Bar */}
      <header className="bg-white border-b border-[#E4E4E0] h-14 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-[#F4F3F6] rounded-md text-[#5E5E5E] hover:text-[#1A1C1E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="border-l border-[#E4E4E0] pl-3">
            <span className="text-xs font-semibold text-[#1A1C1E] line-clamp-1">
              {course?.title || 'Khóa học'}
            </span>
          </div>
        </div>

        {/* Real-time Progress Widget */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5E5E5E] hidden sm:inline">Tiến độ học tập:</span>
            <div className="w-28 sm:w-36 bg-[#E4E4E0] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#22C55E] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-[#16324F]">{progressPercent}%</span>
          </div>

          {quizzes.length > 0 && (
            <button
              onClick={() => onStartQuiz(quizzes[0].id, enrollment?.id)}
              className="px-3.5 py-1.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>Thi trắc nghiệm Quiz</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        
        {/* Left: Multimedia Player & Content (3 Columns) */}
        <main className="lg:col-span-3 p-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] space-y-6">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Media Player Container */}
              <div className="bg-black rounded-xl overflow-hidden shadow-md aspect-video flex items-center justify-center relative">
                {isYouTubeUrl(activeLesson.contentUrl) ? (
                  <iframe
                    key={`${activeLesson.id}-${activeLesson.startSeconds || 0}`}
                    src={`${activeLesson.contentUrl}${activeLesson.contentUrl.includes('?') ? '&' : '?'}autoplay=1&rel=0&start=${activeLesson.startSeconds || 0}`}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : activeLesson.contentType === 'VIDEO' ? (
                  <video
                    key={`${activeLesson.id}-${activeLesson.startSeconds || 0}`}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  >
                    <source src={activeLesson.contentUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'} type="video/mp4" />
                    Trình duyệt của bạn không hỗ trợ phát video HTML5.
                  </video>
                ) : activeLesson.contentType === 'DOCUMENT' ? (
                  <div className="w-full h-full bg-white flex flex-col items-center justify-center p-8 text-center text-[#1A1C1E]">
                    <FileText className="w-16 h-16 text-[#16324F] mb-3 opacity-80" />
                    <h4 className="text-base font-bold font-serif mb-2">Tài liệu học tập đính kèm</h4>
                    <p className="text-xs text-[#5E5E5E] max-w-md mb-4 leading-relaxed">
                      Bài học này cung cấp tài liệu dạng PDF/Văn bản phục vụ ôn tập kiến thức chuyên sâu.
                    </p>
                    <a
                      href={activeLesson.contentUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#16324F] text-white text-xs font-medium rounded-lg flex items-center gap-1.5 hover:bg-[#001D37] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Mở tài liệu toàn màn hình
                    </a>
                  </div>
                ) : (
                  <div className="w-full h-full bg-white p-8 text-[#1A1C1E] overflow-y-auto">
                    <h3 className="text-lg font-bold font-serif mb-3">{activeLesson.title}</h3>
                    <p className="text-xs text-[#5E5E5E] leading-relaxed whitespace-pre-line">
                      {activeLesson.notes || activeLesson.contentUrl || 'Nội dung bài học dạng văn bản hướng dẫn chi tiết.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Lesson Control Header */}
              <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div>
                  <span className="text-[11px] font-semibold text-[#16324F] uppercase tracking-wider bg-[#F4F3F6] px-2 py-0.5 rounded">
                    {activeLesson.contentType || 'VIDEO'} • {activeLesson.durationMinutes || 15} phút
                  </span>
                  <h2 className="text-xl font-bold font-serif text-[#001D37] mt-1.5">
                    {activeLesson.title}
                  </h2>
                </div>

                {/* Mark as completed & Navigation buttons */}
                <div className="flex items-center gap-2">
                  {prevLesson && (
                    <button
                      onClick={() => setActiveLesson(prevLesson)}
                      className="p-2 border border-[#E4E4E0] hover:bg-[#F4F3F6] rounded-lg text-[#5E5E5E] transition-colors"
                      title="Bài trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={handleCompleteLesson}
                    disabled={completing || isCurrentCompleted}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                      isCurrentCompleted
                        ? 'bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#15803D] cursor-default'
                        : 'bg-[#16324F] hover:bg-[#001D37] text-white shadow-xs'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {isCurrentCompleted
                        ? 'Đã hoàn thành bài học'
                        : completing
                        ? 'Đang cập nhật...'
                        : 'Đánh dấu đã hoàn thành'}
                    </span>
                  </button>

                  {nextLesson && (
                    <button
                      onClick={() => setActiveLesson(nextLesson)}
                      className="p-2 border border-[#E4E4E0] hover:bg-[#F4F3F6] rounded-lg text-[#5E5E5E] transition-colors"
                      title="Bài tiếp theo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lecture Detailed Notes & Key Takeaways */}
              {activeLesson.notes && (
                <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs space-y-3">
                  <h3 className="font-serif font-bold text-base text-[#001D37] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#16324F]" />
                    <span>Ghi chú & Tóm tắt kiến thức bài giảng</span>
                  </h3>
                  <div className="text-xs text-[#5E5E5E] leading-relaxed whitespace-pre-line bg-[#FAF9FC] p-4 rounded-lg border border-[#E4E4E0]">
                    {activeLesson.notes}
                  </div>
                </div>
              )}

            </div>
          ) : allLessons.length === 0 ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#001D37]">Khóa học đang cập nhật nội dung bài giảng</h3>
                <p className="text-xs text-[#5E5E5E] max-w-md mt-1 leading-relaxed">
                  Giáo trình và bài tập thực hành của khóa học này đang được ban chuyên môn biên soạn. Vui lòng quay lại sau!
                </p>
              </div>
              <button
                onClick={onBack}
                className="px-5 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
              >
                Quay lại danh sách khóa học
              </button>
            </div>
          ) : (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center py-20 text-xs text-[#5E5E5E] space-y-2">
              <BookOpen className="w-8 h-8 text-[#16324F]/40 mx-auto" />
              <p>Vui lòng chọn bài học từ danh sách đề cương bên phải để bắt đầu học.</p>
            </div>
          )}
        </main>

        {/* Right Sidebar: Curriculum & Progress List (1 Column) */}
        <aside className="bg-white border-l border-[#E4E4E0] p-4 overflow-y-auto max-h-[calc(100vh-3.5rem)] flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#E4E4E0] mb-3">
              <h3 className="font-serif font-bold text-[#001D37] text-sm">Nội dung khóa học</h3>
              <p className="text-[11px] text-[#5E5E5E] mt-0.5">
                {completedCount} / {totalLessons} bài học hoàn thành
              </p>
            </div>

            <div className="space-y-4">
              {sections.map((section, secIdx) => {
                const hasLessons = section.lessons && section.lessons.length > 0;

                return (
                  <div key={section.id || secIdx} className="space-y-1.5">
                    <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">
                      Chương {secIdx + 1}: {section.title}
                    </p>
                    
                    {!hasLessons ? (
                      <div className="p-3 bg-[#FAF9FC] border border-dashed border-[#E4E4E0] rounded-xl text-center my-1.5">
                        <p className="text-[11px] text-[#6B6B6B] italic">Chương này chưa có nội dung bài học</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {section.lessons.map((lesson) => {
                          const isCompleted = completedLessonIds.has(lesson.id);
                          const isActive = activeLesson?.id === lesson.id;

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => setActiveLesson(lesson)}
                              className={`w-full p-2.5 rounded-lg text-left flex items-start gap-2.5 text-xs transition-colors ${
                                isActive
                                  ? 'bg-[#F4F3F6] border border-[#16324F]/30 text-[#16324F] font-semibold'
                                  : 'hover:bg-[#FAF9FC] text-[#1A1C1E]'
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isCompleted ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-[#C3C6CE]" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="line-clamp-2 leading-tight">{lesson.title}</p>
                                <span className="text-[10px] text-[#6B6B6B] flex items-center gap-1 mt-1">
                                  <Clock className="w-2.5 h-2.5" /> {lesson.durationMinutes || 15} phút
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Assessment Notice */}
          <div className="mt-6 pt-4 border-t border-[#E4E4E0] bg-[#FAF9FC] p-3 rounded-lg border border-[#E4E4E0]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#001D37] mb-1">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Cấp Chứng chỉ Tốt nghiệp</span>
            </div>
            <p className="text-[11px] text-[#5E5E5E] leading-relaxed mb-2">
              Hoàn thành 100% bài học và đạt điểm bài Quiz để nhận chứng chỉ số có mã băm UUID.
            </p>
            {quizzes.length > 0 && (
              <button
                onClick={() => onStartQuiz(quizzes[0].id, enrollment?.id)}
                className="w-full py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>Vào làm bài Quiz cuối khóa</span>
              </button>
            )}
          </div>

        </aside>

      </div>

    </div>
  );
};
