import React from 'react';
import { Award, CheckCircle, XCircle, ArrowLeft, Download, ExternalLink, RefreshCw } from 'lucide-react';

export const QuizResultPage = ({ result, onBackToCourse, onRetryQuiz, onViewCertificate }) => {
  if (!result) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-sm font-semibold text-[#1A1C1E]">Chưa có dữ liệu kết quả bài thi.</p>
        <button onClick={onBackToCourse} className="mt-4 px-4 py-2 text-xs bg-[#16324F] text-white rounded-lg">
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
          
          {/* Status Icon */}
          <div className="mb-4 inline-flex items-center justify-center">
            {isPassed ? (
              <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                <CheckCircle className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#BA1A1A]/10 flex items-center justify-center text-[#BA1A1A]">
                <XCircle className="w-10 h-10" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold font-serif text-[#001D37]">
            {isPassed ? 'Chúc mừng! Bạn đã ĐẠT bài kiểm tra' : 'Bạn CHƯA ĐẠT điểm yêu cầu'}
          </h2>

          <p className="text-xs text-[#5E5E5E] mt-2 max-w-md mx-auto leading-relaxed">
            {result.message}
          </p>

          {/* Score Counter */}
          <div className="my-6 py-4 px-6 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl inline-flex items-center gap-6">
            <div>
              <p className="text-[11px] text-[#6B6B6B] uppercase font-semibold">Điểm số của bạn</p>
              <p className={`text-3xl font-bold font-serif ${isPassed ? 'text-[#22C55E]' : 'text-[#BA1A1A]'}`}>
                {result.score}%
              </p>
            </div>
            <div className="border-l border-[#E4E4E0] pl-6">
              <p className="text-[11px] text-[#6B6B6B] uppercase font-semibold">Điểm chuẩn qua môn</p>
              <p className="text-3xl font-bold font-serif text-[#001D37]">
                {result.passingScore}%
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onBackToCourse}
              className="px-4 py-2 bg-white border border-[#E4E4E0] hover:bg-[#FAF9FC] text-[#1A1C1E] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại bài học
            </button>
            {!isPassed && (
              <button
                onClick={onRetryQuiz}
                className="px-4 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Làm lại bài thi
              </button>
            )}
          </div>

        </div>

        {/* Certificate Awarded Section */}
        {cert && (
          <div className="bg-white border-2 border-[#16324F] rounded-xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#16324F]/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>Chứng chỉ số Tốt nghiệp Đã Cấp</span>
            </div>

            <h3 className="text-xl font-bold font-serif text-[#001D37]">
              Chứng nhận hoàn thành: {cert.courseTitle}
            </h3>

            <div className="mt-4 p-4 bg-[#FAF9FC] border border-[#E4E4E0] rounded-lg text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#5E5E5E]">Học viên:</span>
                <span className="font-semibold text-[#1A1C1E]">{cert.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E5E5E]">Giảng viên:</span>
                <span className="font-semibold text-[#1A1C1E]">{cert.instructorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E5E5E]">Mã xác thực (UUID):</span>
                <span className="font-mono font-bold text-[#16324F]">{cert.certificateCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E5E5E]">Ngày cấp:</span>
                <span className="text-[#1A1C1E]">{new Date(cert.issuedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => onViewCertificate(cert.certificateCode)}
                className="flex-1 py-2.5 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Tra cứu & Xem chứng chỉ
              </button>
              <a
                href={`http://localhost:8080/api/v1/certificates/download/${cert.certificateCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white border border-[#E4E4E0] hover:bg-[#FAF9FC] text-[#1A1C1E] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
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
