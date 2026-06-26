import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  Users,
  Bot,
  User,
  Plus,
  LogOut,
} from "lucide-react";

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-teal-500 p-3 rounded-xl">
              <span className="text-white text-lg">♿</span>
            </div>

            <div>
              <h1 className="font-bold text-lg text-gray-900">
                CareRide AI
              </h1>
              <p className="text-xs text-gray-500">
                Accessible mobility
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6">

            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition ${
                isActive("/")
                  ? "bg-teal-500 text-white"
                  : "text-gray-600 hover:text-teal-600"
              }`}
            >
              <Home size={18} />
              Home
            </Link>

            <Link
              to="/travel"
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition"
            >
              <Calendar size={18} />
              My Rides
            </Link>

            <Link
              to="/helpers"
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition"
            >
              <Users size={18} />
              Helpers
            </Link>

            <Link
              to="/ai"
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition"
            >
              <Bot size={18} />
              AI Assistant
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition"
            >
              <User size={18} />
              Profile
            </Link>

          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">

            <Link
              to="/travel/create"
              className="flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-full font-medium hover:bg-teal-600 transition"
            >
              <Plus size={18} />

              {/* Dynamic CTA idea (you can improve later with role) */}
              Book a Ride
            </Link>

            <button className="text-gray-500 hover:text-teal-600 transition">
              <User size={20} />
            </button>

            <button className="text-gray-500 hover:text-red-500 transition">
              <LogOut size={20} />
            </button>

          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;