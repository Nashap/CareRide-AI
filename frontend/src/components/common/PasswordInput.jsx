import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ className = "", ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        {...props}
        className={`w-full border rounded-xl p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-cr-primary ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        onMouseDown={(e) => e.preventDefault()}
        className="absolute inset-y-0 right-0 flex items-center pr-4 text-cr-text-muted hover:text-cr-text-muted transition-colors focus:outline-none"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
