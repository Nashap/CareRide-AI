import { LayoutGrid, Plus, Users, Bot, UserCircle } from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { icon: LayoutGrid, label: "My rides",       path: "/rider-dashboard" },
  { icon: Plus,       label: "Book a ride",    path: "/book-ride" },
  { icon: Users,      label: "Browse helpers", path: "/helpers" },
  { icon: Bot,        label: "AI assistant",   path: "/ai" },
  { icon: UserCircle, label: "Profile",        path: "/profile" },
];

function RiderSidebar() {
  return (
    <aside className="w-44 shrink-0 bg-[#F8F6ED] min-h-[calc(100vh-49px)] pt-4 px-3 flex flex-col gap-0.5">
      {menuItems.map(({ icon: Icon, label, path }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
              isActive
                ? "bg-teal-600 text-white"
                : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"
            }`
          }
        >
          <Icon size={15} />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}

export default RiderSidebar;
