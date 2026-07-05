import {
  LayoutGrid,
  Briefcase,
  Search,
  Clock,
  Bot,
  UserCircle,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function HelperSidebar() {
  const menuItems = [
    {
      icon: LayoutGrid,
      label: "Dashboard",
      path: "/dashboard/helper",
    },
    {
      icon: Briefcase,
      label: "Assigned rides",
      path: "/helper/assigned-rides",
    },
    {
      icon: Search,
      label: "Browse requests",
      path: "/helper/browse-requests",
    },
    {
      icon: Clock,
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

  return (
    <aside className="w-60 flex-shrink-0">
      <div className="bg-cr-card rounded-[24px] border border-cr-border shadow-lg overflow-hidden flex flex-col">
        {menuItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-4 text-[15px] transition
              ${
                isActive
                  ? "bg-cr-primary text-white font-semibold"
                  : "text-cr-text-muted hover:text-cr-primary hover:bg-cr-beige/50"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

export default HelperSidebar;
