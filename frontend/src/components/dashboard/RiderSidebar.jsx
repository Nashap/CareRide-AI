import {
  LayoutGrid,
  Plus,
  Users,
  Bot,
  UserCircle,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    icon: LayoutGrid,
    label: "My rides",
    path: "/rider-dashboard",
  },
  {
    icon: Plus,
    label: "Book a ride",
    path: "/book-ride",
  },
  {
    icon: Users,
    label: "Browse helpers",
    path: "/helpers",
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

function RiderSidebar() {
  return (
    <aside className="w-60 flex-shrink-0">

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {menuItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-4 text-[15px] transition
              ${
                isActive
                  ? "bg-teal-600 text-white font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
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

export default RiderSidebar;