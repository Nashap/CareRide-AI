import { useState, useEffect } from "react";
import { CheckCircle, X, AlertCircle } from "lucide-react";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-800 shadow-xl rounded-lg px-4 py-3 min-w-[300px]">
      {type === "success" ? (
        <CheckCircle className="text-teal-400" size={20} />
      ) : (
        <AlertCircle className="text-red-400" size={20} />
      )}
      <p className="text-white font-medium flex-1 text-sm">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        className="text-gray-400 hover:text-white transition"
      >
        <X size={16} />
      </button>
    </div>
  );
}
