import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({
  name,
  value,
  onChange,
  children,
  className = "",
  placeholder,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Extract options from children <option> tags
  const options = React.Children.map(children, (child) => {
    if (child && child.type === 'option') {
       return {
         value: child.props.value !== undefined ? child.props.value : child.props.children,
         label: child.props.children,
         disabled: child.props.disabled,
       };
    }
    return null;
  }).filter(Boolean);

  const selectedOption = options.find((opt) => String(opt.value) === String(value)) || options[0];
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const isPlaceholderSelected = !value || value === "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val, disabled) => {
    if (disabled) return;
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[52px] bg-white rounded-[14px] px-4 text-left text-sm transition-all duration-300 flex items-center justify-between focus:outline-none focus:border-[#1A3F75] focus:ring-4 focus:ring-[#A9C7E3]/20
          ${isOpen 
            ? 'border-[#1A3F75] border ring-4 ring-[#A9C7E3]/20' 
            : 'border border-[#A9C7E3] hover:border-[#5F82A8] shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
          }
        `}
        style={{ backgroundColor: 'var(--cr-card)' }}
      >
        <span className={`block truncate ${isPlaceholderSelected ? 'text-[#5F82A8]' : 'text-[#00002A]'}`}>
          {displayLabel}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-[#5F82A8]" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute z-[99] top-[calc(100%+8px)] left-0 w-full bg-white rounded-[14px] shadow-[0_12px_40px_rgba(26,63,117,0.12)] border border-[#A9C7E3]/40 p-2"
            style={{ backgroundColor: 'var(--cr-card)' }}
          >
            <div className="max-h-[260px] overflow-y-auto space-y-1 pr-1">
              {options.map((opt, i) => {
                const isSelected = String(opt.value) === String(value);
                // Hide placeholder option from the dropdown menu if it's empty
                if (opt.value === "" && opt.disabled) return null;
                
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value, opt.disabled)}
                    className={`w-full text-left px-4 py-3 rounded-[10px] text-sm transition-colors duration-200
                      ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      ${isSelected 
                        ? 'bg-[#DDEAF5] text-[#00002A] font-semibold' 
                        : 'bg-transparent text-[#00002A] hover:bg-[#EEF5FF] hover:text-[#1A3F75]'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
