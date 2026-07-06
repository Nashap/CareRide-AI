import {
  LayoutGrid,
  ClipboardList,
  Search,
  Calendar,
  Bot,
  UserCircle,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const menuItems = [
  {
    icon: LayoutGrid,
    label: "Dashboard",
    path: "/dashboard/helper",
  },
  {
    icon: ClipboardList,
    label: "Assigned rides",
    path: "/helper/assigned-rides",
  },
  {
    icon: Search,
    label: "Browse requests",
    path: "/helper/browse-requests",
  },
  {
    icon: Calendar,
    label: "Availability",
    path: "/helper/availability",
  },
  {
    icon: Bot,
    label: "AI assistant",
    path: "/ai",
  },
  {
    icon: UserCircle,
    label: "Profile",
    path: "/profile",
  },
];

function HelperSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-helper-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-helper-sidebar', handleToggle);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const SidebarContent = (
    <div className="bg-cr-card md:rounded-[24px] border-r md:border border-cr-border md:shadow-lg overflow-y-auto h-full flex flex-col pt-4 md:pt-0">
      <div className="md:hidden flex items-center justify-between p-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cr-primary flex items-center justify-center shadow-sm">
            <UserCircle size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold text-cr-text-primary tracking-tight">Helper Menu</span>
        </div>
        <button 
          onClick={() => setIsOpen(false)} 
          className="p-2 min-h-[48px] min-w-[48px] flex items-center justify-center text-cr-text-primary bg-cr-bg rounded-full border border-cr-border"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex flex-col gap-2 px-4 md:px-0">
        {menuItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-3.5 min-h-[52px] text-[16px] md:text-[15px] transition-all rounded-[14px] md:rounded-none md:first:rounded-t-[24px] md:last:rounded-b-[24px]
              ${
                isActive
                  ? "bg-cr-primary text-white font-semibold shadow-md"
                  : "text-cr-text-muted hover:text-cr-primary hover:bg-cr-surface"
              }`
            }
          >
            <Icon size={20} className="md:w-[17px] md:h-[17px]" />
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-60 flex-shrink-0">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {createPortal(
        <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none delay-100'}`}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
            onClick={() => setIsOpen(false)} 
          />
          {/* Drawer Panel */}
          <aside className={`absolute top-0 left-0 w-[85%] max-w-sm h-full bg-cr-card shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {SidebarContent}
          </aside>
        </div>,
        document.body
      )}
    </>
  );
}

export default HelperSidebar;
