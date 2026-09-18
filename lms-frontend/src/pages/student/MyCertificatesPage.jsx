import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { certificateApi } from '../../api/certificateApi';
import { learningApi } from '../../api/learningApi';
import { useAuth } from '../../context/AuthContext';
import { Award, Search, CheckCircle, Download, ExternalLink, Printer, ShieldCheck, AlertCircle, Copy, Check } from 'lucide-react';

export const MyCertificatesPage = ({ initialCode: initialCodeProp }) => {
  const [searchParams] = useSearchParams();
  const initialCode = initialCodeProp || searchParams.get('code') || '';
  const { user } = useAuth();
  const [searchCode, setSearchCode] = useState(initialCode || '');
  const [verifiedCert, setVerifiedCert] = useState(null);
  const [myCertificates, setMyCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-verify if initialCode passed
  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
  }, [initialCode]);

  // Fetch my certificates
  useEffect(() => {
    const fetchMyCerts = async () => {
      if (!user) return;
      try {
        const enrollRes = await learningApi.getMyEnrollments();
        const completedEnrollments = enrollRes.data.filter((e) => e.isCompleted);
        
        const certPromises = completedEnrollments.map((e) =>
          certificateApi.getCertificateByEnrollment(e.id).catch(() => null)
        );
        const certResults = await Promise.all(certPromises);
        setMyCertificates(certResults.filter((c) => c && c.data).map((c) => c.data));
      } catch (err) {
        console.warn('Lỗi khi tải danh sách chứng chỉ:', err);
      }
    };

    fetchMyCerts();
  }, [user]);

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || searchCode;
    if (!code.trim()) return;

    setError('');
    setLoading(true);
    try {
      const res = await certificateApi.verifyCertificate(code.trim());
      setVerifiedCert(res.data);
    } catch (err) {
      setVerifiedCert(null);
      setError(
        err.response?.data?.message ||
        'Không tìm thấy chứng chỉ số với mã xác thực này hoặc mã băm không hợp lệ!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F3F6] border border-[#E4E4E0] rounded-full text-xs font-semibold text-[#16324F] mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tra cứu & Xác thực Chứng chỉ số Công khai</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-[#001D37]">
            Chứng nhận Tốt nghiệp & Tra cứu Xác thực
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-2 leading-relaxed">
            Nhập mã định danh băm UUID để kiểm tra tính hợp lệ và chi tiết chứng chỉ số được cấp bởi hệ thống EduMOOC.
          </p>

          {/* Search Box */}
          <div className="mt-6 flex items-center bg-white border border-[#E4E4E0] rounded-lg p-1.5 shadow-xs focus-within:border-[#16324F]">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Nhập mã chứng chỉ (ví dụ: CERT-XXXXXXXX-XXXXX)..."
              className="flex-1 px-3 text-xs bg-transparent focus:outline-none text-[#1A1C1E] font-mono placeholder:font-sans placeholder:text-[#6B6B6B]"
            />
            <button
              onClick={() => handleVerify()}
              disabled={loading}
              className="px-4 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Đang tra cứu...' : 'Xác thực'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#FFDAD6] border border-[#BA1A1A]/30 text-[#93000A] text-xs rounded-lg flex items-center gap-2 max-w-xl mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Verified Certificate Display (Scholarly Diploma Card) */}
        {verifiedCert && (
          <div className="bg-white border-4 border-double border-[#16324F] rounded-2xl p-8 md:p-12 shadow-md relative print:border-black print:m-0 space-y-8">
            
            {/* Diploma Brand Header */}
            <div className="text-center border-b border-[#E4E4E0] pb-6">
              <div className="w-14 h-14 bg-[#002D72] text-white rounded-2xl mx-auto flex items-center justify-center font-bold text-2xl font-serif mb-3 shadow-sm">
                E
              </div>
              <h2 className="text-base font-bold text-[#002D72] tracking-widest uppercase font-serif">
                EDUMOOC ACADEMY
              </h2>
              <p className="text-[11px] text-[#4A5568] tracking-wider uppercase mt-0.5">
                HỆ THỐNG ĐÀO TẠO TRỰC TUYẾN QUỐC TẾ • INTERNATIONAL ONLINE LEARNING SYSTEM
              </p>
              
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" /> Chứng chỉ số hợp lệ & đã xác thực
                </span>
                {verifiedCert.finalScore && verifiedCert.finalScore >= 90 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#002D72] text-[#D4AF37] border border-[#D4AF37]">
                    ★ WITH DISTINCTION ({verifiedCert.finalScore}%)
                  </span>
                )}
              </div>
            </div>

            {/* Recipient & Course Statement */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <p className="text-xs text-[#5E5E5E] uppercase tracking-widest font-medium">
                Chứng nhận cấp cho học viên
              </p>
              <h3 className="text-3xl md:text-4xl font-bold font-serif text-[#001D37] tracking-tight">
                {verifiedCert.studentName}
              </h3>
              <p className="text-xs text-[#5E5E5E]">{verifiedCert.studentEmail}</p>

              <div className="py-4">
                <p className="text-xs text-[#5E5E5E] italic">
                  {verifiedCert.finalScore && verifiedCert.finalScore >= 90
                    ? 'has successfully completed with distinction / đã hoàn thành xuất sắc khóa học'
                    : 'has successfully completed / đã hoàn thành khóa học'}
                </p>
                <h4 className="text-2xl md:text-3xl font-bold font-serif text-[#002D72] mt-2 leading-snug">
                  {verifiedCert.courseTitle}
                </h4>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl text-xs max-w-2xl mx-auto">
              <div>
                <span className="block text-[#6B6B6B]">Giảng viên:</span>
                <span className="font-semibold text-[#1A1C1E]">{verifiedCert.instructorName}</span>
              </div>
              <div>
                <span className="block text-[#6B6B6B]">Thời lượng:</span>
                <span className="font-semibold text-[#1A1C1E]">
                  {verifiedCert.totalDurationMinutes && verifiedCert.totalDurationMinutes >= 60
                    ? `${Math.floor(verifiedCert.totalDurationMinutes / 60)} giờ học`
                    : '36 giờ học'}
                </span>
              </div>
              <div>
                <span className="block text-[#6B6B6B]">Ngày cấp:</span>
                <span className="font-semibold text-[#1A1C1E]">
                  {new Date(verifiedCert.issuedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div>
                <span className="block text-[#6B6B6B]">Kết quả thi:</span>
                <span className="font-semibold text-[#002D72]">
                  {verifiedCert.finalScore ? `${verifiedCert.finalScore}% (Đạt)` : 'Hoàn thành 100%'}
                </span>
              </div>
            </div>

            {/* UUID Hash Code with Copy */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs max-w-2xl mx-auto">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[#6B6B6B] shrink-0 font-medium">Mã UUID:</span>
                <span className="font-mono font-bold text-[#002D72] truncate">{verifiedCert.certificateCode}</span>
              </div>
              <button
                onClick={() => handleCopyCode(verifiedCert.certificateCode)}
                className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-[#002D72] px-2.5 py-1 rounded bg-white border border-slate-200 shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* Actions Toolbar */}
            <div className="pt-4 border-t border-[#E4E4E0] flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
              <a
                href={certificateApi.getDownloadUrl(verifiedCert.certificateCode)}
                download={`certificate-${verifiedCert.certificateCode}.pdf`}
                className="w-full sm:w-auto px-6 py-3 bg-[#002D72] hover:bg-[#001D37] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" /> Tải file PDF chính thức (Chuẩn Coursera)
              </a>

              <button
                onClick={handlePrint}
                className="w-full sm:w-auto px-5 py-3 bg-white border border-[#E4E4E0] hover:bg-[#FAF9FC] text-[#1A1C1E] text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" /> In chứng chỉ
              </button>
            </div>

            {/* Note banner */}
            <p className="text-[11px] text-center text-[#718096] print:hidden">
              * Tệp PDF tải về định dạng A4 Landscape có đầy đủ dải ruy băng danh dự, con dấu dập nổi, mã QR Code bảo mật và chữ ký viết tay quốc tế.
            </p>

          </div>
        )}

        {/* My Certificates List (If logged in) */}
        {user && myCertificates.length > 0 && (
          <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold font-serif text-[#001D37] mb-4">
              Danh sách Chứng chỉ số của bạn ({myCertificates.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCertificates.map((cert) => (
                <div
                  key={cert.id}
                  onClick={() => setVerifiedCert(cert)}
                  className="p-4 border border-[#E4E4E0] rounded-lg hover:border-[#16324F] cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold font-serif text-[#001D37] group-hover:text-[#16324F]">
                      {cert.courseTitle}
                    </h4>
                    <p className="text-[11px] font-mono text-[#6B6B6B] mt-1">{cert.certificateCode}</p>
                    <span className="text-[10px] text-[#5E5E5E]">
                      {new Date(cert.issuedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#6B6B6B] group-hover:text-[#16324F] transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
