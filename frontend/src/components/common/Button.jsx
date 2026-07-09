import React from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary: "bg-[#1A3F75] md:hover:bg-[#00002A] active:bg-[#00001A] text-white shadow-md md:hover:shadow-lg border border-transparent",
  secondary: "bg-[#DDEAF5] md:hover:bg-[#5F82A8] active:bg-[#4A6D93] text-[#1A3F75] md:hover:text-white border border-transparent",
  outline: "bg-transparent border-2 border-[#1A3F75] text-[#1A3F75] md:hover:bg-[#1A3F75] md:hover:text-white",
  ghost: "bg-transparent md:hover:bg-gray-100 active:bg-gray-200 text-gray-700 border border-transparent shadow-none md:hover:shadow-none",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center font-bold rounded-xl transition-all
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A3F75]
        disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
        transform md:hover:-translate-y-0.5 min-h-[44px]
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin mr-2" aria-hidden="true" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
