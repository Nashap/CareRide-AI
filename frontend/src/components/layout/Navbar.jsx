import { Link } from "react-router-dom";
import { HeartHandshake } from "lucide-react";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-center justify-between h-20">

          {/* Logo */}

          <Link
            to="/"
            className="flex items-center gap-3"
          >

            <div className="w-11 h-11 rounded-full bg-teal-600 flex items-center justify-center shadow-md">

              <HeartHandshake
                size={22}
                className="text-white"
              />

            </div>

            <div>

              <h1 className="text-xl font-bold text-slate-900">

                CareRide AI

              </h1>

            </div>

          </Link>

          {/* Center Menu */}

          <div className="hidden lg:flex items-center gap-10">

            <a
              href="#home"
              className="text-gray-600 hover:text-teal-600 transition font-medium"
            >
              Home
            </a>

            <a
              href="#features"
              className="text-gray-600 hover:text-teal-600 transition font-medium"
            >
              Features
            </a>

            <a
              href="#services"
              className="text-gray-600 hover:text-teal-600 transition font-medium"
            >
              Services
            </a>

          </div>

          {/* Right Buttons */}

          <div className="flex items-center gap-4">

            <Link
              to="/login"
              className="text-gray-700 font-medium hover:text-teal-600 transition"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105"
            >
              Get Started
            </Link>

          </div>

        </div>

      </div>
    </header>
  );
}

export default Navbar;