import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { certificateApi } from '../../api/certificateApi';
import { Award, CheckCircle, XCircle, ArrowLeft, Download, ExternalLink, RefreshCw } from 'lucide-react';

export const QuizResultPage = ({ result: resultProp, onBackToCourse, onRetryQuiz, onViewCertificate }) => {
  const location = useLocation();
  const { quizId } = useParams();
  const navigate = useNavigate();

  const result = resultProp || location.state?.result;

  const handleBackToCourse = () => {
    if (onBackToCourse) onBackToCourse();
    else navigate('/my-learning');
  };

  const handleRetry = () => {
    if (onRetryQuiz) onRetryQuiz();
    else navigate(`/quiz/${quizId || 1}`);
  };

  const handleViewCert = (certCode) => {
    if (onViewCertificate) onViewCertificate(certCode);
    else navigate(`/certificates?code=${encodeURIComponent(certCode)}`);
  };

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-sm font-semibold text-[#1A1C1E]">Chưa có dữ liệu kết quả bài thi.</p>
        <button onClick={handleBackToCourse} className="mt-4 px-4 py-2 text-xs bg-[#16324F] text-white rounded-lg cursor-pointer">
          Quay lại khóa học
        </button>
      </div>
    );
  }

  const isPassed = result.passed;
  const cert = result.certificate;

  return (
    <div className="min-h-screen bg-[#FAF9FC] py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Result Card */}
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-8 text-center shadow-xs">
          
          <div className="flex justify-center mb-4">
            {isPassed ? (
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-100 animate-in zoom-in">
                <CheckCircle className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border-4 border-rose-100 animate-in zoom-in">
                <XCircle className="w-8 h-8" />
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold font-serif text-[#001D37]">
            {isPassed ? 'Chúc mừng bạn đã vượt qua bài kiểm tra!' : 'Rất tiếc, bạn chưa đạt điểm yêu cầu!'}
          </h2>
          <p className="text-xs text-[#5E5E5E] mt-2 max-w-md mx-auto leading-relaxed">
            {result.message || (isPassed
              ? 'Bạn đã hoàn thành xuất sắc yêu cầu của khóa học và đủ điều kiện nhận chứng chỉ.'
              : 'Hãy ôn tập lại kiến thức các bài học trước và làm lại bài kiểm tra.')}
          </p>

          {/* Score Box */}
          <div className="my-6 p-4 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl inline-block min-w-[200px]">
            <p className="text-3xl font-bold font-serif text-[#16324F]">
              {result.score} / {result.totalScore || 100}
            </p>
            <p className="text-xs font-semibold text-[#5E5E5E] mt-1">
              Điểm số ({result.score}%) • Cần đạt: {result.passingScore}%
            </p>
          </div>


          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleBackToCourse}
              className="w-full sm:w-auto px-5 py-2.5 bg-white border border-[#E4E4E0] hover:bg-[#FAF9FC] text-[#1A1C1E] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay về bài học
            </button>

            {!isPassed && (
              <button
                onClick={handleRetry}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Làm lại bài thi
              </button>
            )}
          </div>
        </div>

        {/* Certificate Claim Card (If Passed & Issued) */}
        {isPassed && cert && (
          <div className="bg-white border-2 border-emerald-200 rounded-xl p-6 shadow-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#001D37]">Chứng chỉ hoàn thành khóa học</h3>
                <p className="text-[11px] text-[#5E5E5E]">Đã được hệ thống xác thực và cấp mã định danh số</p>
              </div>
            </div>

            <div className="p-4 bg-[#FAF9FC] border border-[#E4E4E0] rounded-lg space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5E5E5E]">Mã chứng chỉ (UUID):</span>
                <span className="font-mono font-bold text-[#16324F]">{cert.certificateCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E5E5E]">Người nhận:</span>
                <span className="font-semibold text-[#1A1C1E]">{cert.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E5E5E]">Ngày cấp:</span>
                <span className="text-[#1A1C1E]">{new Date(cert.issuedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => handleViewCert(cert.certificateCode)}
                className="flex-1 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Tra cứu & Xem chứng chỉ
              </button>
              <a
                href={certificateApi.getDownloadUrl(cert.certificateCode)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white border border-[#E4E4E0] hover:bg-[#FAF9FC] text-[#1A1C1E] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Tải file
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
