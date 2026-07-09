import React from "react";

const FloatingInput = React.forwardRef(({ id, name, type = "text", placeholder, className = "", ...props }, ref) => {
  const inputId = id || name;
  
  return (
    <div className="relative w-full">
      <input
        type={type}
        id={inputId}
        name={name}
        placeholder={placeholder}
        ref={ref}
        {...props}
        className={`peer w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 pt-6 pb-2 focus:outline-none focus:ring-2 focus:ring-[#1A3F75]/20 focus:border-[#1A3F75] transition-all placeholder-transparent disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      />
      <label
        htmlFor={inputId}
        className="absolute left-4 top-2 text-xs font-medium text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#1A3F75] pointer-events-none"
      >
        {placeholder}
      </label>
    </div>
  );
});

FloatingInput.displayName = "FloatingInput";

export default FloatingInput;
