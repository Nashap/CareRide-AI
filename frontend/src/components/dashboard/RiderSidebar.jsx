import { LayoutGrid, Plus, Users, Bot, UserCircle } from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { icon: LayoutGrid, label: "My rides",       path: "/rider-dashboard", plusIcon: false },
  { icon: Plus,       label: "Book a ride",    path: "/book-ride",       plusIcon: true  },
  { icon: Users,      label: "Browse helpers", path: "/helpers",         plusIcon: false },
  { icon: Bot,        label: "AI assistant",   path: "/ai",              plusIcon: false },
  { icon: UserCircle, label: "Profile",        path: "/profile",         plusIcon: false },
];

function RiderSidebar() {
  return (
    <aside className="w-72 shrink-0 bg-[#F5F0E8] min-h-[calc(100vh-57px)] pt-6 px-5">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        {menuItems.map(({ icon: Icon, label, path, plusIcon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition border-b border-gray-100 last:border-b-0 ${
                isActive
                  ? "bg-teal-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            {plusIcon
              ? <Plus size={15} />
              : <Icon size={15} />
            }
            {label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

export default RiderSidebar;
