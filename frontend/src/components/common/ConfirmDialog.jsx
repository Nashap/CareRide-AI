import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import LoadingScreen from "./LoadingScreen";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isProcessing = false,
  iconType = "danger" // "danger" or "warning"
}) {
  const cancelBtnRef = useRef(null);
  
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isProcessing) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Auto-focus cancel button for accessibility
      setTimeout(() => {
        if (cancelBtnRef.current) {
          cancelBtnRef.current.focus();
        }
      }, 50);
    }
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, isProcessing]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !isProcessing && onClose()}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        className="relative bg-cr-card rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 border border-cr-surface animate-in zoom-in-95 duration-200 flex flex-col gap-4"
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${iconType === "danger" ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"}`}>
            {iconType === "danger" ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
          </div>
          
          {/* Text */}
          <div className="flex flex-col pt-1">
            <h3 id="dialog-title" className="text-xl font-bold text-cr-primary">
              {title}
            </h3>
            <p id="dialog-description" className="text-cr-secondary text-sm mt-2 whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            ref={cancelBtnRef}
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl border border-cr-surface text-cr-secondary bg-cr-card font-medium hover:bg-cr-bg focus:ring-2 focus:ring-offset-2 focus:ring-cr-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
