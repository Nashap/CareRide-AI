import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function PasswordInput({ className = "", id, placeholder = "Password", ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const inputId = id || props.name;

  const handleKeyDown = (e) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          id={inputId}
          name={props.name}
          placeholder=" "
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyDown}
          {...props}
          className="block px-4 pb-2.5 pt-6 w-full text-base font-medium text-gray-900 bg-gray-50 rounded-xl border border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1A3F75]/20 focus:border-[#1A3F75] peer transition-all pr-24 shadow-sm [&:-webkit-autofill]:bg-gray-50 [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#F9FAFB] [&:-webkit-autofill]:-webkit-text-fill-color-gray-900"
        />
        <label
          htmlFor={inputId}
          className="absolute text-sm font-medium text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-4 peer-focus:text-[#1A3F75] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none"
        >
          {placeholder}
        </label>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          {capsLockActive && (
            <div title="Caps Lock is ON" className="text-amber-500 pointer-events-none">
              <AlertTriangle size={18} />
            </div>
          )}
          
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            onMouseDown={(e) => e.preventDefault()}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3F75] rounded p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
