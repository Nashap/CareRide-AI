import {
  LayoutDashboard,
  Car,
  Users,
  Bot,
  UserCircle,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function RiderSidebar() {
  const menuItems = [
    {
      title: "My Rides",
      icon: <LayoutDashboard size={20} />,
      path: "/rider-dashboard",
    },
    {
      title: "Book a Ride",
      icon: <Car size={20} />,
      path: "/book-ride",
    },
    {
      title: "Browse Helpers",
      icon: <Users size={20} />,
      path: "/helpers",
    },
    {
      title: "AI Assistant",
      icon: <Bot size={20} />,
      path: "/ai",
    },
    {
      title: "Profile",
      icon: <UserCircle size={20} />,
      path: "/profile",
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 min-h-screen">

      {/* Logo */}
      <div className="p-8 border-b">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
            CR
          </div>

          <div>
            <h2 className="font-bold text-xl text-gray-800">
              CareRide AI
            </h2>

            <p className="text-sm text-gray-500">
              Rider Portal
            </p>
          </div>

        </div>

      </div>

      {/* Menu */}
      <nav className="mt-6 px-4">

        {menuItems.map((item) => (

          <NavLink
            key={item.title}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-4 rounded-xl mb-3 transition-all font-medium ${
                isActive
                  ? "bg-teal-500 text-white shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            {item.title}
          </NavLink>

        ))}

      </nav>

      {/* Bottom Card */}
      <div className="mx-4 mt-10 p-5 rounded-2xl bg-teal-50 border border-teal-100">

        <h3 className="font-semibold text-teal-700 mb-2">
          Need Assistance?
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Our AI can help you find the most suitable helper for your journey.
        </p>

        <button className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg transition">
          Ask AI
        </button>

      </div>

    </aside>
  );
}

export default RiderSidebar;