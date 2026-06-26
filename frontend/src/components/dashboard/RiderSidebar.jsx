import {
  Car,
  Users,
  Bot,
  User,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function RiderSidebar() {
  const menuItems = [
    {
      title: "My Rides",
      icon: <Car size={18} />,
      path: "/rider-dashboard",
    },
    {
      title: "Book a Ride",
      icon: <Car size={18} />,
      path: "/book-ride",
    },
    {
      title: "Browse Helpers",
      icon: <Users size={18} />,
      path: "/helpers",
    },
    {
      title: "AI Assistant",
      icon: <Bot size={18} />,
      path: "/ai",
    },
    {
      title: "Profile",
      icon: <User size={18} />,
      path: "/profile",
    },
  ];

  return (
    <aside className="w-64 bg-[#F8F6ED] border-r border-gray-200 p-5">

      <div className="bg-white rounded-2xl p-3 shadow-sm">

        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 text-sm font-medium transition ${
                isActive
                  ? "bg-teal-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            {item.title}
          </NavLink>
        ))}

      </div>

    </aside>
  );
}

export default RiderSidebar;