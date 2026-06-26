import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake, LogOut, User } from "lucide-react";

function RiderNavbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">

      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link
            to="/rider-dashboard"
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-full bg-teal-600 flex items-center justify-center shadow-md">
              <HeartHandshake
                size={22}
                className="text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                CareRide AI
              </h1>

              <span className="px-2 py-0.5 text-[11px] rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Rider
              </span>
            </div>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-6">

            <div className="flex items-center gap-2 text-gray-600 text-sm">

              <User size={15} />

              <span>
                {user?.email || "user@gmail.com"}
              </span>

            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-teal-600 transition font-medium"
            >
              <LogOut size={17} />
              Sign Out
            </button>

          </div>

        </div>

      </div>

    </header>
  );
}

export default RiderNavbar;