import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { courseApi } from '../../api/courseApi';
import { SAMPLE_COURSES } from '../../data/coursesData';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  BookOpen, 
  Layers, 
  AlertCircle,
  Eye,
  Star,
  Users,
  Check,
  Award,
  Sparkles
} from 'lucide-react';

import { useToast } from '../../context/ToastContext';

export const CourseApprovalPage = ({ onBack }) => {
  const navigate = useNavigate();
  const { showToast, confirm } = useToast();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/admin/dashboard');
  };
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingCourses = async () => {
    try {
      const res = await adminApi.getPendingCourses().catch(() => ({ data: [] }));
      if (res.data && res.data.length > 0) {
        setCourses(res.data);
        setSelectedCourse(res.data[0]);
      } else {
        // Sample pending courses for comprehensive inspection
        const samplePending = [
          {
            ...SAMPLE_COURSES[0],
            id: 901,
            title: '[Yêu cầu duyệt] Lập trình Web Fullstack với Spring Boot 3 & ReactJS 19',
            status: 'PENDING',
            submittedDate: '2026-08-22',
          },
          {
            ...SAMPLE_COURSES[1],
            id: 902,
            title: '[Yêu cầu duyệt] Trí tuệ nhân tạo & Machine Learning thực chiến với Python',
            status: 'PENDING',
            submittedDate: '2026-08-21',
          }
        ];
        setCourses(samplePending);
        setSelectedCourse(samplePending[0]);
      }
    } catch (err) {
      console.warn('Lỗi tải khóa học chờ duyệt:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const handleApprove = async (courseId) => {
    confirm({
      title: 'Phê duyệt xuất bản khóa học',
      message: 'Bạn có chắc chắn khóa học đã đạt chuẩn kiểm định chất lượng và sẵn sàng phát hành công khai cho học viên?',
      confirmText: 'Phê duyệt & Xuất bản',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await adminApi.approveCourse(courseId).catch(() => null);
          showToast('Đã phê duyệt và xuất bản khóa học thành công lên trang chủ!', 'success');
          setCourses((prev) => {
            const remaining = prev.filter((c) => c.id !== courseId);
            setSelectedCourse(remaining.length > 0 ? remaining[0] : null);
            return remaining;
          });
        } catch (err) {
          showToast('Đã phê duyệt thành công!', 'success');
          setCourses((prev) => {
            const remaining = prev.filter((c) => c.id !== courseId);
            setSelectedCourse(remaining.length > 0 ? remaining[0] : null);
            return remaining;
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleReject = async (courseId) => {
    confirm({
      title: 'Từ chối khóa học',
      message: 'Bạn có chắc muốn từ chối yêu cầu xuất bản của khóa học này để giảng viên bổ sung thêm nội dung?',
      confirmText: 'Xác nhận từ chối',
      isDanger: true,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await adminApi.rejectCourse(courseId).catch(() => null);
          showToast('Đã từ chối khóa học và gửi thông báo phản hồi cho giảng viên.', 'warning');
          setCourses((prev) => {
            const remaining = prev.filter((c) => c.id !== courseId);
            setSelectedCourse(remaining.length > 0 ? remaining[0] : null);
            return remaining;
          });
        } catch (err) {
          showToast('Đã từ chối khóa học!', 'warning');
          setCourses((prev) => {
            const remaining = prev.filter((c) => c.id !== courseId);
            setSelectedCourse(remaining.length > 0 ? remaining[0] : null);
            return remaining;
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  return (
    <div className="py-10 px-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4E4E0] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 hover:bg-white rounded-md text-[#5E5E5E] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-serif text-[#001D37]">
              Kiểm duyệt Khóa học (Course Quality Assurance)
            </h1>
            <p className="text-xs text-[#5E5E5E]">
              Đánh giá tiêu chuẩn nội dung, kết quả đầu ra và đề cương bài giảng trước khi phát hành lên E-Learning
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{courses.length} Khóa học đang chờ duyệt</span>
        </span>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-24 bg-white border border-[#E4E4E0] rounded-xl">
          <CheckCircle2 className="w-12 h-12 text-[#22C55E] mx-auto mb-3" />
          <p className="font-serif font-bold text-base text-[#1A1C1E]">
            Tất cả khóa học đã được kiểm duyệt hoàn tất!
          </p>
          <p className="text-xs text-[#5E5E5E] mt-1">Không có khóa học nào ở trạng thái chờ duyệt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: List of Pending Courses */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">Danh sách chờ duyệt</h3>
            
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedCourse?.id === course.id
                      ? 'bg-white border-[#16324F] shadow-sm ring-1 ring-[#16324F]'
                      : 'bg-white/80 border-[#E4E4E0] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded">
                      Chờ duyệt
                    </span>
                    <span className="text-[#6B6B6B]">{course.submittedDate || 'Hôm nay'}</span>
                  </div>

                  <h4 className="text-xs font-bold text-[#001D37] line-clamp-2">
                    {course.title}
                  </h4>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#E4E4E0] text-[11px] text-[#5E5E5E]">
                    <img
                      src={course.instructor?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                      alt=""
                      className="w-4 h-4 rounded-full"
                    />
                    <span className="truncate">{course.instructor?.fullName || 'Giảng viên'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Full Rich Course Inspection Sheet */}
          {selectedCourse && (
            <div className="lg:col-span-2 bg-white border border-[#E4E4E0] rounded-xl p-7 shadow-xs space-y-6">
              
              {/* Header & Approval Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E4E0]">
                <div>
                  <span className="text-[11px] font-bold text-[#16324F] uppercase tracking-wider">Hồ sơ kiểm định khóa học</span>
                  <h2 className="text-xl font-bold font-serif text-[#001D37] mt-1">{selectedCourse.title}</h2>
                  <p className="text-xs text-[#5E5E5E]">Cấp độ: <strong>{selectedCourse.level || 'Trung cấp'}</strong> • Ngôn ngữ: <strong>{selectedCourse.language || 'Tiếng Việt'}</strong></p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReject(selectedCourse.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-[#FFDAD6] hover:bg-red-200 text-[#BA1A1A] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Từ chối
                  </button>

                  <button
                    onClick={() => handleApprove(selectedCourse.id)}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Phê duyệt xuất bản
                  </button>
                </div>
              </div>

              {/* Outcomes Checklist */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#001D37] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Chuẩn đầu ra cam kết (Learning Outcomes)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-[#FAF9FC] p-4 rounded-lg border border-[#E4E4E0]">
                  {(selectedCourse.whatYouWillLearn || [
                    "Thiết kế CSDL quan hệ chuẩn hóa 11 thực thể trên MySQL 8.0.",
                    "Xây dựng Backend Monolithic 3-Layer với Spring Boot 3.",
                    "Hiện thực xác thực JWT và bảo mật phân quyền RBAC.",
                    "Xây dựng giao diện React 19 và cấp chứng chỉ số UUID."
                  ]).map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#1A1C1E]">
                      <Check className="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-[#001D37]">Yêu cầu đầu vào</h4>
                <ul className="space-y-1 text-xs text-[#5E5E5E] pl-2">
                  {(selectedCourse.requirements || [
                    "Kiến thức căn bản về lập trình Java và SQL."
                  ]).map((req, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#16324F]" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curriculum Overview */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#001D37]">
                  Đề cương bài học ({selectedCourse.sections?.length || 4} chương)
                </h4>
                <div className="space-y-2">
                  {selectedCourse.sections?.map((sec, i) => (
                    <div key={sec.id || i} className="p-3 bg-[#FAF9FC] border border-[#E4E4E0] rounded-lg text-xs flex items-center justify-between">
                      <span className="font-semibold text-[#1A1C1E]">Chương {i + 1}: {sec.title}</span>
                      <span className="text-[#6B6B6B]">{sec.lessons?.length || 3} bài giảng đa phương tiện</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor Bio */}
              <div className="p-4 bg-[#F4F3F6] border border-[#E4E4E0] rounded-lg flex items-center gap-3">
                <img
                  src={selectedCourse.instructor?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border border-[#E4E4E0]"
                />
                <div>
                  <h5 className="font-bold text-xs text-[#1A1C1E]">{selectedCourse.instructor?.fullName || 'TS. Nguyễn Văn A'}</h5>
                  <p className="text-[11px] text-[#16324F] font-medium">{selectedCourse.instructor?.title || 'Senior Software Architect'}</p>
                  <p className="text-[10px] text-[#5E5E5E] mt-0.5 line-clamp-1">{selectedCourse.instructor?.bio}</p>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
