import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [modalConfig, setModalConfig] = useState(null);

  // Add toast notification
  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Custom in-app Confirmation Dialog
  const confirm = useCallback(({ title, message, confirmText = 'Xác nhận', cancelText = 'Hủy', onConfirm, isDanger = false, isWarning = false }) => {
    setModalConfig({
      title,
      message,
      confirmText,
      cancelText,
      isDanger,
      isWarning,
      onConfirm: () => {
        setModalConfig(null);
        if (onConfirm) onConfirm();
      },
      onCancel: () => setModalConfig(null),
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, confirm }}>
      {children}

      {/* Floating Toasts Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start gap-3 transition-all duration-300 transform translate-y-0 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-white/95 border-[#22C55E]/40 text-[#1A1C1E]'
                : toast.type === 'error'
                ? 'bg-white/95 border-[#BA1A1A]/40 text-[#1A1C1E]'
                : toast.type === 'warning'
                ? 'bg-white/95 border-amber-500/40 text-[#1A1C1E]'
                : 'bg-white/95 border-blue-500/40 text-[#1A1C1E]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-[#BA1A1A]" />}
              {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>

            <div className="flex-1 text-xs leading-relaxed font-medium">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#6B6B6B] hover:text-[#1A1C1E] p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* In-app Confirmation Modal */}
      {modalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E4E4E0] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif font-bold text-lg text-[#001D37]">
              {modalConfig.title || 'Xác nhận thao tác'}
            </h3>
            <p className="text-xs text-[#5E5E5E] leading-relaxed">
              {modalConfig.message}
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E4E4E0]">
              <button
                onClick={modalConfig.onCancel}
                className="px-4 py-2 text-xs font-semibold text-[#5E5E5E] hover:bg-[#FAF9FC] rounded-lg border border-[#E4E4E0] transition-colors"
              >
                {modalConfig.cancelText}
              </button>
              <button
                onClick={modalConfig.onConfirm}
                className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm ${
                  modalConfig.isDanger
                    ? 'bg-[#BA1A1A] hover:bg-red-700'
                    : modalConfig.isWarning
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-[#16324F] hover:bg-[#001D37]'
                }`}
              >
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
