import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function PasswordInput({ className = "", id, placeholder = "Password", showStrength = false, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const inputId = id || props.name;
  
  // Calculate password strength based on length and characters
  const calculateStrength = (password) => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Normalize to 0-3
    return Math.min(3, Math.max(1, score));
  };
  
  const strength = calculateStrength(props.value || "");
  const strengthColors = ["bg-gray-200", "bg-red-500", "bg-yellow-500", "bg-green-500"];
  const strengthLabels = ["", "Weak", "Medium", "Strong"];

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
      
      {showStrength && props.value && props.value.length > 0 && (
        <div className="flex flex-col gap-1 mt-1 px-1">
          <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden">
            <div className={`h-full flex-1 transition-colors ${strength >= 1 ? strengthColors[strength] : "bg-gray-200"}`} />
            <div className={`h-full flex-1 transition-colors ${strength >= 2 ? strengthColors[strength] : "bg-gray-200"}`} />
            <div className={`h-full flex-1 transition-colors ${strength >= 3 ? strengthColors[strength] : "bg-gray-200"}`} />
          </div>
          <p className={`text-xs font-medium text-right ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
            {strengthLabels[strength]}
          </p>
        </div>
      )}
    </div>
  );
}
