import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Eye, 
  Ban, 
  RotateCcw, 
  AlertCircle, 
  X,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  FileCheck2,
  UserCheck
} from 'lucide-react';
import { 
  useAdminCertificates, 
  useAdminCertificateSummary, 
  useRevokeCertificate, 
  useReinstateCertificate 
} from '../../hooks/useAdminCertificates';
import { certificateApi } from '../../api/certificateApi';
import { Pagination } from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';

const PAGE_SIZE = 10;

export const AdminCertificatesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast, confirm } = useToast();

  const urlQ = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlQ);
  const [debouncedQ, setDebouncedQ] = useState(urlQ);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal xem chi tiết chứng chỉ trực tiếp trong Admin (không chuyển về role học viên)
  const [previewTarget, setPreviewTarget] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modal thu hồi
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeError, setRevokeError] = useState('');

  // Đồng bộ search query từ URL param (ví dụ khi bấm từ thông báo CERTIFICATE_ISSUED)
  useEffect(() => {
    if (urlQ !== searchQuery) {
      setSearchQuery(urlQ);
      setDebouncedQ(urlQ);
      setCurrentPage(1);
    }
  }, [urlQ]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(searchQuery);
      setCurrentPage(1);
      if (searchQuery.trim()) {
        setSearchParams({ q: searchQuery.trim() });
      } else {
        setSearchParams({});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, setSearchParams]);

  // API hooks
  const { data: summary = { total: 0, valid: 0, revoked: 0 }, isLoading: isSummaryLoading } = useAdminCertificateSummary();

  const { data, isLoading, isError, error } = useAdminCertificates({
    page: currentPage - 1,
    size: PAGE_SIZE,
    q: debouncedQ.trim() || undefined,
    status: selectedStatus || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
  });

  const revokeMutation = useRevokeCertificate();
  const reinstateMutation = useReinstateCertificate();

  const certificates = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedQ('');
    setSelectedStatus('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleOpenRevokeModal = (cert) => {
    setRevokeTarget(cert);
    setRevokeReason('');
    setRevokeError('');
  };

  const handleCloseRevokeModal = () => {
    setRevokeTarget(null);
    setRevokeReason('');
    setRevokeError('');
  };

  const handleConfirmRevoke = async () => {
    if (!revokeReason.trim()) {
      setRevokeError('Vui lòng nhập lý do thu hồi chứng chỉ!');
      return;
    }

    try {
      const updated = await revokeMutation.mutateAsync({
        id: revokeTarget.id,
        reason: revokeReason.trim(),
      });
      showToast(`Đã thu hồi chứng chỉ ${revokeTarget.certificateCode}`, 'info');
      if (previewTarget && previewTarget.id === revokeTarget.id) {
        setPreviewTarget(updated?.data || { ...previewTarget, status: 'REVOKED', revokeReason: revokeReason.trim() });
      }
      handleCloseRevokeModal();
    } catch (err) {
      setRevokeError(err.response?.data?.message || 'Có lỗi xảy ra khi thu hồi chứng chỉ!');
    }
  };

  const handleReinstate = (cert) => {
    confirm({
      title: 'Khôi phục hiệu lực chứng chỉ',
      message: `Bạn có chắc chắn muốn khôi phục hiệu lực cho chứng chỉ ${cert.certificateCode} của học viên "${cert.studentName}"?`,
      confirmText: 'Khôi phục hiệu lực',
      cancelText: 'Hủy bỏ',
      onConfirm: async () => {
        try {
          const res = await reinstateMutation.mutateAsync(cert.id);
          showToast(`Đã khôi phục hiệu lực chứng chỉ ${cert.certificateCode}`, 'success');
          if (previewTarget && previewTarget.id === cert.id) {
            setPreviewTarget(res?.data || { ...previewTarget, status: 'VALID', revokeReason: null, revokedAt: null });
          }
        } catch (err) {
          showToast(err.response?.data?.message || 'Có lỗi xảy ra khi khôi phục chứng chỉ!', 'error');
        }
      },
    });
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const hasActiveFilters = Boolean(searchQuery || selectedStatus || fromDate || toDate);

  return (
    <div className="py-10 px-8 space-y-8 max-w-[1400px] mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-[#001D37]" />
            <h1 className="text-2xl font-bold  text-[#001D37]">
              Quản lý Chứng chỉ số (Certificate Governance)
            </h1>
          </div>
          <p className="text-xs text-[#5E5E5E] mt-1">
            Tra cứu, kiểm tra tính pháp lý, xuất file PDF và quản lý thu hồi hoặc khôi phục chứng chỉ tốt nghiệp toàn hệ thống trực tiếp trong phân hệ Quản trị.
          </p>
        </div>
      </div>

      {/* 3 Thẻ thống kê (Clickable để lọc trạng thái) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Tổng chứng chỉ */}
        <div 
          onClick={() => { setSelectedStatus(''); setCurrentPage(1); }}
          className={`p-6 bg-white border rounded-2xl shadow-xs transition-all cursor-pointer hover:shadow-md ${
            selectedStatus === '' 
              ? 'border-[#001D37] ring-2 ring-[#001D37]/10' 
              : 'border-[#E4E4E0] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#5E5E5E] uppercase tracking-wider">
                Tổng số chứng chỉ
              </p>
              <h3 className="text-3xl font-bold text-[#001D37] mt-2 ">
                {isSummaryLoading ? '...' : summary.total}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-[#718096] mt-3">
            Tất cả chứng nhận đã được hệ thống cấp
          </p>
        </div>

        {/* Còn hiệu lực */}
        <div 
          onClick={() => { setSelectedStatus('VALID'); setCurrentPage(1); }}
          className={`p-6 bg-white border rounded-2xl shadow-xs transition-all cursor-pointer hover:shadow-md ${
            selectedStatus === 'VALID' 
              ? 'border-emerald-600 ring-2 ring-emerald-500/20' 
              : 'border-[#E4E4E0] hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Còn hiệu lực (Hợp lệ)
              </p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-2 ">
                {isSummaryLoading ? '...' : summary.valid}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-[#718096] mt-3">
            Chứng chỉ hợp lệ, tra cứu và tải PDF bình thường
          </p>
        </div>

        {/* Đã thu hồi */}
        <div 
          onClick={() => { setSelectedStatus('REVOKED'); setCurrentPage(1); }}
          className={`p-6 bg-white border rounded-2xl shadow-xs transition-all cursor-pointer hover:shadow-md ${
            selectedStatus === 'REVOKED' 
              ? 'border-red-600 ring-2 ring-red-500/20' 
              : 'border-[#E4E4E0] hover:border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                Đã thu hồi (Vô hiệu hóa)
              </p>
              <h3 className="text-3xl font-bold text-red-600 mt-2 ">
                {isSummaryLoading ? '...' : summary.revoked}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-[#718096] mt-3">
            Chứng chỉ bị thu hồi do vi phạm hoặc gian lận
          </p>
        </div>

      </div>

      {/* Bộ lọc & Tìm kiếm */}
      <div className="bg-white border border-[#E4E4E0] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Ô tìm kiếm q */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã chứng chỉ, tên hoặc email học viên, tên khóa học..."
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#001D37] text-[#1A1C1E]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Lọc trạng thái */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 text-xs bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#001D37] text-[#1A1C1E] cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="VALID">Còn hiệu lực (Hợp lệ)</option>
              <option value="REVOKED">Đã thu hồi</option>
            </select>
          </div>

          {/* Khoảng ngày cấp: Từ ngày */}
          <div className="md:col-span-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
              aria-label="Từ ngày"
              className="w-full px-3 py-2 text-xs bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#001D37] text-[#1A1C1E]"
            />
          </div>

          {/* Khoảng ngày cấp: Đến ngày */}
          <div className="md:col-span-2">
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
              aria-label="Đến ngày"
              className="w-full px-3 py-2 text-xs bg-[#FAF9FC] border border-[#E4E4E0] rounded-xl focus:outline-none focus:border-[#001D37] text-[#1A1C1E]"
            />
          </div>

        </div>

        {/* Sub-bar: Reset button & Active filter tags */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-500">
              Đang lọc danh sách chứng chỉ theo tiêu chí tùy chỉnh
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Bảng danh sách chứng chỉ */}
      <div className="bg-white border border-[#E4E4E0] rounded-2xl shadow-xs overflow-hidden">
        
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-400">
            Đang tải dữ liệu chứng chỉ...
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-xs text-red-600">
            Lỗi khi tải danh sách chứng chỉ: {error?.message}
          </div>
        ) : certificates.length === 0 ? (
          <div className="py-20 text-center">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700">
              {hasActiveFilters ? 'Không tìm thấy chứng chỉ nào phù hợp' : 'Chưa có chứng chỉ nào được cấp'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {hasActiveFilters ? 'Thử thay đổi từ khóa hoặc điều kiện lọc' : 'Khi học viên hoàn thành khóa học, chứng chỉ sẽ hiển thị tại đây'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9FC] text-[#5E5E5E] border-b border-[#E4E4E0] uppercase font-semibold tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Mã chứng chỉ</th>
                  <th className="py-3.5 px-4">Học viên</th>
                  <th className="py-3.5 px-4">Khóa học</th>
                  <th className="py-3.5 px-4">Ngày cấp</th>
                  <th className="py-3.5 px-4">Điểm số</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E0]">
                {certificates.map((cert) => {
                  const isRevoked = cert.status === 'REVOKED';

                  return (
                    <tr 
                      key={cert.id} 
                      className={`hover:bg-[#FAF9FC] transition-colors ${
                        isRevoked ? 'bg-red-50/20' : ''
                      }`}
                    >
                      {/* Mã chứng chỉ (Click để xem chi tiết ngay trong Admin) */}
                      <td className="py-4 px-4 font-mono font-bold text-[#001D37]">
                        <button
                          type="button"
                          onClick={() => setPreviewTarget(cert)}
                          className="hover:text-blue-600 hover:underline cursor-pointer text-left"
                          title="Xem chi tiết chứng chỉ"
                        >
                          {cert.certificateCode}
                        </button>
                      </td>

                      {/* Học viên */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#1A1C1E]">
                          {cert.studentName}
                        </div>
                        <div className="text-[11px] text-[#6B6B6B]">
                          {cert.studentEmail}
                        </div>
                      </td>

                      {/* Khóa học */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-semibold text-[#1A1C1E] truncate" title={cert.courseTitle}>
                          {cert.courseTitle}
                        </div>
                        <div className="text-[11px] text-[#6B6B6B] truncate">
                          GV: {cert.instructorName || 'Chưa cập nhật'}
                        </div>
                      </td>

                      {/* Ngày cấp */}
                      <td className="py-4 px-4 text-[#5E5E5E] whitespace-nowrap">
                        {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString('vi-VN') : '—'}
                      </td>

                      {/* Điểm số */}
                      <td className="py-4 px-4 font-semibold whitespace-nowrap">
                        {cert.finalScore != null ? (
                          <span className={cert.finalScore >= 90 ? 'text-amber-600 font-bold' : 'text-[#001D37]'}>
                            {cert.finalScore}%
                          </span>
                        ) : (
                          <span className="text-gray-500 font-normal">Đạt 100%</span>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isRevoked ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                              <XCircle className="w-3.5 h-3.5 text-red-600" /> Đã thu hồi
                            </span>
                            {cert.revokeReason && (
                              <p className="text-[10px] text-red-600 mt-1 max-w-[180px] truncate" title={`Lý do: ${cert.revokeReason} (bởi ${cert.revokedByName || 'Admin'})`}>
                                Lý do: {cert.revokeReason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Còn hiệu lực
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          
                          {/* Xem chi tiết chứng chỉ trực tiếp trong Admin (Không chuyển sang role học viên) */}
                          <button
                            type="button"
                            onClick={() => setPreviewTarget(cert)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết chứng chỉ"
                            aria-label="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Tải PDF (chỉ khi VALID) */}
                          {!isRevoked && (
                            <a
                              href={certificateApi.getDownloadUrl(cert.certificateCode)}
                              download={`certificate-${cert.certificateCode}.pdf`}
                              className="p-1.5 text-gray-500 hover:text-[#001D37] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              title="Tải tệp PDF chính thức"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}

                          {/* Thu hồi hoặc Khôi phục */}
                          {isRevoked ? (
                            <button
                              onClick={() => handleReinstate(cert)}
                              disabled={reinstateMutation.isPending}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              title="Khôi phục hiệu lực chứng chỉ"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Khôi phục</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenRevokeModal(cert)}
                              disabled={revokeMutation.isPending}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              title="Thu hồi chứng chỉ"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Thu hồi</span>
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#E4E4E0]">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Modal Xem chi tiết Chứng chỉ Trực tiếp trong Admin Portal */}
      {previewTarget && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header (Fixed top) */}
            <div className="shrink-0 px-5 sm:px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#001D37]" />
                <h3 className=" font-bold text-sm sm:text-base text-[#001D37]">
                  Chi tiết Chứng chỉ số Định danh (Admin Preview)
                </h3>
              </div>
              <button
                onClick={() => setPreviewTarget(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable if screen is small) */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              
              {/* Diploma Display Card */}
              <div className={`diploma-card bg-[#FAF9FC] border-4 border-double ${
                previewTarget.status === 'REVOKED' ? 'border-red-400' : 'border-[#16324F]'
              } rounded-2xl p-4 sm:p-6 space-y-4 text-center relative shadow-sm`}>
                
                <div className="border-b border-[#E4E4E0] pb-3">
                  <div className={`w-10 h-10 ${
                    previewTarget.status === 'REVOKED' ? 'bg-red-800' : 'bg-[#002D72]'
                  } text-white rounded-xl mx-auto flex items-center justify-center font-bold text-lg  mb-1.5 shadow-2xs`}>
                    E
                  </div>
                  <h4 className="text-[11px] font-bold text-[#002D72] tracking-widest uppercase ">
                    EDUMOOC ACADEMY
                  </h4>
                  <p className="text-[9px] text-[#4A5568] uppercase tracking-wider">
                    HỆ THỐNG ĐÀO TẠO TRỰC TUYẾN QUỐC TẾ
                  </p>

                  <div className="flex items-center justify-center flex-wrap gap-2 mt-2.5">
                    {previewTarget.status === 'REVOKED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                        <XCircle className="w-3.5 h-3.5 text-red-600" /> ĐÃ THU HỒI HIỆU LỰC
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> CHỨNG CHỈ HỢP LỆ & ĐÃ XÁC THỰC
                      </span>
                    )}
                    {previewTarget.status !== 'REVOKED' && previewTarget.finalScore && previewTarget.finalScore >= 90 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#002D72] text-[#D4AF37] border border-[#D4AF37]">
                        ★ WITH DISTINCTION ({previewTarget.finalScore}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="space-y-1">
                  <p className="text-[10px] text-[#5E5E5E] uppercase tracking-widest font-medium">
                    Chứng nhận cấp cho học viên
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold  text-[#001D37]">
                    {previewTarget.studentName}
                  </h3>
                  <p className="text-[11px] text-[#5E5E5E]">{previewTarget.studentEmail}</p>

                  <div className="pt-1.5">
                    <p className="text-[11px] text-[#5E5E5E] italic">
                      đã hoàn thành khóa học
                    </p>
                    <h4 className="text-base sm:text-lg font-bold  text-[#002D72] mt-0.5">
                      {previewTarget.courseTitle}
                    </h4>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-white border border-[#E4E4E0] rounded-xl text-left text-xs">
                  <div>
                    <span className="block text-[#6B6B6B] text-[10px]">Giảng viên:</span>
                    <span className="font-semibold text-[#1A1C1E] text-[11px] truncate block" title={previewTarget.instructorName}>
                      {previewTarget.instructorName || 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[#6B6B6B] text-[10px]">Ngày cấp:</span>
                    <span className="font-semibold text-[#1A1C1E] text-[11px] block">
                      {previewTarget.issuedAt ? new Date(previewTarget.issuedAt).toLocaleDateString('vi-VN') : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[#6B6B6B] text-[10px]">Kết quả:</span>
                    <span className="font-semibold text-[#002D72] text-[11px] block">
                      {previewTarget.finalScore != null ? `${previewTarget.finalScore}% (Đạt)` : 'Hoàn thành 100%'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[#6B6B6B] text-[10px]">Thời lượng:</span>
                    <span className="font-semibold text-[#1A1C1E] text-[11px] block">
                      {previewTarget.totalDurationMinutes ? `${Math.floor(previewTarget.totalDurationMinutes / 60)} giờ` : 'Tiêu chuẩn'}
                    </span>
                  </div>
                </div>

                {/* Revoke details banner */}
                {previewTarget.status === 'REVOKED' && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-left text-xs text-red-800 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Lý do thu hồi: {previewTarget.revokeReason || 'Không có lý do chi tiết'}</span>
                    </div>
                    {previewTarget.revokedByName && (
                      <p className="text-[11px] text-red-600">
                        Thu hồi bởi: {previewTarget.revokedByName} {previewTarget.revokedAt ? `vào ngày ${new Date(previewTarget.revokedAt).toLocaleDateString('vi-VN')}` : ''}
                      </p>
                    )}
                  </div>
                )}

                {/* UUID Code copy */}
                <div className="flex items-center justify-between p-2.5 bg-white border border-[#E4E4E0] rounded-xl text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[#6B6B6B] shrink-0 font-medium text-[11px]">Mã UUID:</span>
                    <span className="font-mono font-bold text-[#002D72] text-xs truncate">{previewTarget.certificateCode}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(previewTarget.certificateCode)}
                    className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-[#002D72] px-2.5 py-1 rounded bg-slate-50 border border-slate-200 transition-colors cursor-pointer shrink-0 font-medium"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Actions Toolbar (Fixed bottom) */}
            <div className="shrink-0 px-5 sm:px-6 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/70 rounded-b-2xl">
              <div className="flex items-center gap-2">
                {previewTarget.status === 'REVOKED' ? (
                  <button
                    onClick={() => handleReinstate(previewTarget)}
                    disabled={reinstateMutation.isPending}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Khôi phục hiệu lực</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenRevokeModal(previewTarget)}
                    disabled={revokeMutation.isPending}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Thu hồi chứng chỉ</span>
                  </button>
                )}

                {previewTarget.status !== 'REVOKED' && (
                  <a
                    href={certificateApi.getDownloadUrl(previewTarget.certificateCode)}
                    download={`certificate-${previewTarget.certificateCode}.pdf`}
                    className="px-4 py-2 bg-[#001D37] hover:bg-[#16324F] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải tệp PDF</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => setPreviewTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200/70 bg-white border border-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Modal Thu hồi chứng chỉ */}
      {revokeTarget && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-semibold text-base">
                <Ban className="w-5 h-5" />
                <span>Thu hồi chứng chỉ tốt nghiệp</span>
              </div>
              <button
                onClick={handleCloseRevokeModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
              <div>
                <span className="text-gray-500">Mã chứng chỉ:</span>{' '}
                <strong className="font-mono text-[#001D37]">{revokeTarget.certificateCode}</strong>
              </div>
              <div>
                <span className="text-gray-500">Học viên:</span>{' '}
                <strong className="text-gray-900">{revokeTarget.studentName}</strong> ({revokeTarget.studentEmail})
              </div>
              <div>
                <span className="text-gray-500">Khóa học:</span>{' '}
                <strong className="text-gray-900">{revokeTarget.courseTitle}</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Lý do thu hồi <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={revokeReason}
                onChange={(e) => {
                  setRevokeReason(e.target.value);
                  setRevokeError('');
                }}
                placeholder="Nhập lý do cụ thể (ví dụ: phát hiện hành vi gian lận trong bài kiểm tra trắc nghiệm, khóa học bị khiếu nại...)..."
                className="w-full p-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 text-gray-900 placeholder:text-gray-400"
              />
              {revokeError && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{revokeError}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={handleCloseRevokeModal}
                disabled={revokeMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmRevoke}
                disabled={revokeMutation.isPending}
                className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
              >
                <Ban className="w-4 h-4" />
                <span>{revokeMutation.isPending ? 'Đang xử lý...' : 'Xác nhận thu hồi'}</span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
