import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ className = "", id, placeholder = "Password", ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || props.name;

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? "text" : "password"}
        id={inputId}
        placeholder={placeholder}
        {...props}
        className={`peer w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 pt-6 pb-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#1A3F75]/20 focus:border-[#1A3F75] transition-all placeholder-transparent ${className}`}
      />
      <label
        htmlFor={inputId}
        className="absolute left-4 top-2 text-xs font-medium text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#1A3F75] pointer-events-none"
      >
        {placeholder}
      </label>
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        onMouseDown={(e) => e.preventDefault()}
        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3F75] rounded-r-xl"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
