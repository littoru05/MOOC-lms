import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, Check, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { fileApi } from '../../api/fileApi';
import { useToast } from '../../context/ToastContext';

export const ImageUploadInput = ({
  value = '',
  onChange,
  label = 'Ảnh đại diện / Ảnh bìa',
  placeholder = 'Nhập URL ảnh hoặc tải file từ máy...',
  helpText = 'Hỗ trợ: JPG, PNG, WEBP (Tối đa 5MB)',
  className = '',
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast('Kích thước file vượt quá giới hạn 5MB!', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      showToast('Chỉ chấp nhận file ảnh định dạng: JPG, PNG, WEBP!', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Create local object URL for instant preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    setUploading(true);
    try {
      const res = await fileApi.uploadFile(file);
      // Construct full URL or relative URL (e.g. /api/v1/files/uuid.png)
      const uploadedUrl = res.url;
      setPreviewUrl(uploadedUrl);
      if (onChange) {
        onChange(uploadedUrl);
      }
      showToast('Tải ảnh từ máy lên thành công!', 'success');
    } catch (err) {
      console.error('Lỗi upload file:', err);
      showToast(err.response?.data?.message || 'Không thể tải ảnh lên, vui lòng thử lại!', 'error');
      // Revert preview to original value on failure
      setPreviewUrl(value);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlInputChange = (e) => {
    const newUrl = e.target.value;
    setPreviewUrl(newUrl);
    if (onChange) {
      onChange(newUrl);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[#1A1C1E]">
          {label}
        </label>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Manual URL Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5E5E5E]">
            <LinkIcon className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={value || ''}
            onChange={handleUrlInputChange}
            placeholder={placeholder}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#16324F] text-[#1A1C1E] transition-colors"
          />
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-3.5 py-2 bg-[#FAF9FC] hover:bg-[#F4F3F6] border border-[#E4E4E0] text-[#16324F] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16324F]" />
              <span>Đang tải lên...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-[#16324F]" />
              <span>Chọn ảnh từ máy</span>
            </>
          )}
        </button>
      </div>

      {helpText && (
        <p className="text-[11px] text-[#5E5E5E]">
          {helpText}
        </p>
      )}
    </div>
  );
};
