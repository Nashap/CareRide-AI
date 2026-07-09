import React from "react";

const FloatingInput = React.forwardRef(({ id, name, type = "text", label, placeholder, className = "", ...props }, ref) => {
  const inputId = id || name;
  const floatingLabel = label || placeholder;
  
  return (
    <div className={`relative w-full ${className}`}>
      <input
        type={type}
        id={inputId}
        name={name}
        placeholder=" "
        ref={ref}
        {...props}
        className="block px-4 pb-2.5 pt-6 w-full text-base font-medium text-gray-900 bg-gray-50 rounded-xl border border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1A3F75]/20 focus:border-[#1A3F75] peer transition-all shadow-sm [&:-webkit-autofill]:bg-gray-50 [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#F9FAFB] [&:-webkit-autofill]:-webkit-text-fill-color-gray-900"
      />
      <label
        htmlFor={inputId}
        className="absolute text-sm font-medium text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-4 peer-focus:text-[#1A3F75] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none"
      >
        {floatingLabel}
      </label>
    </div>
  );
});

FloatingInput.displayName = "FloatingInput";

export default FloatingInput;
