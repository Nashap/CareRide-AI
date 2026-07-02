import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake, LogOut, User } from "lucide-react";

function HelperNavbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login", { state: { message: "You have been signed out successfully." } });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/dashboard/helper"
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
                Helper
              </span>
            </div>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <User size={15} />
              <span>
                {user?.email || "helper@gmail.com"}
              </span>
            </div>

            <button
              onClick={() => setShowSignOutModal(true)}
              className="flex items-center gap-2 text-gray-700 hover:text-teal-600 transition font-medium"
            >
              <LogOut size={17} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      {showSignOutModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm border border-gray-100 mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Out</h3>
            <p className="text-gray-600 text-sm mb-6">Are you sure you want to sign out?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="px-4 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      
    </header>
  );
}

export default HelperNavbar;
