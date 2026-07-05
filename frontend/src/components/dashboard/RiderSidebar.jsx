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
    path: "/my-rides",
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

      <div className="bg-cr-card rounded-[24px] border border-cr-border shadow-lg overflow-hidden">

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

export default RiderSidebar;