import React, { useState, useEffect } from 'react';
import { certificateApi } from '../../api/certificateApi';
import { learningApi } from '../../api/learningApi';
import { useAuth } from '../../context/AuthContext';
import { Award, Search, CheckCircle, Download, ExternalLink, Printer, ShieldCheck, AlertCircle } from 'lucide-react';

export const MyCertificatesPage = ({ initialCode }) => {
  const { user } = useAuth();
  const [searchCode, setSearchCode] = useState(initialCode || '');
  const [verifiedCert, setVerifiedCert] = useState(null);
  const [myCertificates, setMyCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
              className="px-4 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
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

        {/* Verified Certificate Display (Scholarly Diploma Format) */}
        {verifiedCert && (
          <div className="bg-white border-8 border-double border-[#16324F] p-8 md:p-12 rounded-xl shadow-md relative print:border-black print:m-0">
            
            {/* Watermark Logo */}
            <div className="text-center border-b border-[#E4E4E0] pb-6 mb-6">
              <div className="w-12 h-12 bg-[#16324F] text-white rounded-xl mx-auto flex items-center justify-center font-bold text-2xl font-serif mb-2">
                E
              </div>
              <h2 className="text-sm font-bold text-[#16324F] tracking-widest uppercase font-serif">
                HỆ THỐNG ĐÀO TẠO TRỰC TUYẾN MOOC - EDUMOOC PLATFORM
              </h2>
              <p className="text-[11px] text-[#5E5E5E] tracking-wider uppercase mt-1">
                Chứng chỉ số Tốt nghiệp có giá trị xác thực công khai
              </p>
            </div>

            <div className="text-center space-y-4 my-8">
              <p className="text-xs text-[#5E5E5E] uppercase tracking-widest">Chứng nhận cấp cho học viên</p>
              <h3 className="text-3xl font-bold font-serif text-[#001D37] tracking-tight">
                {verifiedCert.studentName}
              </h3>
              <p className="text-xs text-[#5E5E5E]">{verifiedCert.studentEmail}</p>

              <div className="my-6">
                <p className="text-xs text-[#5E5E5E]">Đã hoàn thành xuất sắc toàn bộ chương trình và bài khảo thí khóa học:</p>
                <h4 className="text-2xl font-bold font-serif text-[#16324F] mt-2">
                  {verifiedCert.courseTitle}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#E4E4E0] text-left text-xs max-w-lg mx-auto">
                <div>
                  <p className="text-[#6B6B6B]">Giảng viên phụ trách:</p>
                  <p className="font-semibold text-[#1A1C1E]">{verifiedCert.instructorName}</p>
                </div>
                <div>
                  <p className="text-[#6B6B6B]">Ngày cấp chứng chỉ:</p>
                  <p className="font-semibold text-[#1A1C1E]">
                    {new Date(verifiedCert.issuedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[#6B6B6B]">Mã xác thực duy nhất (UUID Hash):</p>
                  <p className="font-mono font-bold text-[#16324F]">{verifiedCert.certificateCode}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-[#E4E4E0] print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-white border border-[#E4E4E0] hover:bg-[#FAF9FC] text-[#1A1C1E] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> In chứng chỉ
              </button>
              <a
                href={`http://localhost:8080/api/v1/certificates/download/${verifiedCert.certificateCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#16324F] hover:bg-[#001D37] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Tải file xác nhận
              </a>
            </div>

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
