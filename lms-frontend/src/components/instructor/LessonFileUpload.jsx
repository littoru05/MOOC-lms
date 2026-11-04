import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Video, 
  FileText, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import { fileApi } from '../../api/fileApi';

export const LessonFileUpload = ({
  contentType = 'VIDEO',
  value = '',
  onChange,
  onDurationDetected,
  onUploadStateChange,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const isVideo = contentType === 'VIDEO';
  const fileTypeParam = isVideo ? 'video' : 'document';

  // Đồng bộ trạng thái uploading ra component cha để khóa nút "Lưu bài giảng"
  useEffect(() => {
    if (onUploadStateChange) {
      onUploadStateChange(uploading);
    }
  }, [uploading, onUploadStateChange]);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const validateFile = (file) => {
    if (!file) return false;

    const fileName = file.name || '';
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

    if (isVideo) {
      const validExtensions = ['.mp4', '.webm'];
      if (!validExtensions.includes(ext)) {
        setErrorMessage('Video tối đa 200MB, định dạng MP4 hoặc WebM');
        return false;
      }
      if (file.size > 200 * 1024 * 1024) {
        setErrorMessage('Video tối đa 200MB, định dạng MP4 hoặc WebM');
        return false;
      }
    } else {
      if (ext !== '.pdf') {
        setErrorMessage('Tài liệu tối đa 20MB, định dạng PDF');
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        setErrorMessage('Tài liệu tối đa 20MB, định dạng PDF');
        return false;
      }
    }

    setErrorMessage('');
    return true;
  };

  const detectVideoDuration = (file) => {
    if (!isVideo || typeof window === 'undefined' || !window.URL) return;

    try {
      const tempUrl = URL.createObjectURL(file);
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';

      videoElement.onloadedmetadata = () => {
        URL.revokeObjectURL(tempUrl);
        const durationSec = videoElement.duration;
        if (durationSec && !isNaN(durationSec) && durationSec > 0) {
          const minutes = Math.ceil(durationSec / 60);
          if (onDurationDetected) {
            onDurationDetected(minutes);
          }
        }
      };

      videoElement.onerror = () => {
        URL.revokeObjectURL(tempUrl);
      };

      videoElement.src = tempUrl;
    } catch (e) {
      // Bỏ qua nếu môi trường test/headless không hỗ trợ Audio/Video decoders
    }
  };

  const handleProcessFile = async (file) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFileName(file.name);
    setSelectedFileSize(formatFileSize(file.size));
    setErrorMessage('');

    // Đọc thời lượng video
    if (isVideo) {
      detectVideoDuration(file);
    }

    // Bắt đầu tải lên
    setUploading(true);
    setUploadProgress(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await fileApi.uploadFile(file, fileTypeParam, {
        signal: abortController.signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      if (res && res.url) {
        onChange(res.url);
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        setErrorMessage('Đã hủy quá trình tải tệp lên.');
      } else {
        const backendMsg = err.response?.data?.message || err.message || 'Lỗi khi tải tệp lên máy chủ!';
        setErrorMessage(backendMsg);
      }
    } finally {
      setUploading(false);
      abortControllerRef.current = null;
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUploading(false);
    setUploadProgress(0);
    setSelectedFileName('');
    setSelectedFileSize('');
  };

  const handleClearSelected = () => {
    setSelectedFileName('');
    setSelectedFileSize('');
    setErrorMessage('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const acceptMime = isVideo ? 'video/mp4,video/webm' : 'application/pdf';
  const buttonLabel = isVideo ? 'Chọn video từ máy' : 'Chọn tài liệu PDF';
  const urlPlaceholder = isVideo ? 'Dán liên kết YouTube hoặc video...' : 'Dán liên kết tài liệu hoặc URL...';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-medium text-[#1A1C1E]">
          {isVideo ? 'Video bài giảng (Tải lên hoặc URL)' : 'Tài liệu bài giảng (Tải PDF hoặc URL)'}
        </label>
        {selectedFileName && (
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Đã chọn tệp
          </span>
        )}
      </div>

      {/* Dropzone & File Pick Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-3 transition-colors text-center ${
          isDragging 
            ? 'border-[#16324F] bg-blue-50/60' 
            : 'border-[#E4E4E0] hover:border-gray-400 bg-[#FAF9FC]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptMime}
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
          data-testid="lesson-file-input"
        />

        {!uploading ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E4E4E0] hover:border-[#16324F] text-[#16324F] rounded-lg text-xs font-semibold shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {isVideo ? (
                <Video className="w-3.5 h-3.5 text-[#16324F]" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-[#16324F]" />
              )}
              <span>{buttonLabel}</span>
            </button>
            <span className="text-[11px] text-[#5E5E5E]">
              hoặc kéo thả tệp vào đây ({isVideo ? 'MP4, WebM ≤ 200MB' : 'PDF ≤ 20MB'})
            </span>
          </div>
        ) : (
          /* Uploading state with Progress Bar and Cancel Button */
          <div className="space-y-2 py-1 max-w-sm mx-auto">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#16324F] flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16324F]" />
                Đang tải lên... {uploadProgress}%
              </span>
              <button
                type="button"
                onClick={handleCancelUpload}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Hủy tải lên
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#16324F] h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-[#5E5E5E] truncate">
              {selectedFileName} ({selectedFileSize})
            </div>
          </div>
        )}

        {/* Selected file info when not uploading and URL is set to an uploaded file */}
        {selectedFileName && !uploading && (
          <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-[#E4E4E0] rounded-lg text-xs text-[#1A1C1E]">
            <UploadCloud className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-medium truncate max-w-[200px]">{selectedFileName}</span>
            <span className="text-[#5E5E5E] text-[10px]">({selectedFileSize})</span>
            <button
              type="button"
              onClick={handleClearSelected}
              className="text-[#5E5E5E] hover:text-rose-600 p-0.5 cursor-pointer ml-1"
              title="Xóa tệp đã chọn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Alternative URL Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#5E5E5E]">
          <LinkIcon className="w-3.5 h-3.5" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value.startsWith('http://') || e.target.value.startsWith('https://')) {
              setSelectedFileName('');
              setSelectedFileSize('');
            }
          }}
          placeholder={urlPlaceholder}
          disabled={disabled || uploading}
          className="w-full pl-8 pr-8 py-1.5 text-xs border border-[#E4E4E0] rounded-lg bg-white focus:outline-none focus:border-[#16324F] placeholder:text-[#8E8E93]"
        />
        {value && !uploading && (
          <button
            type="button"
            onClick={handleClearSelected}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#5E5E5E] hover:text-[#1A1C1E] cursor-pointer"
            title="Xóa URL"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

