import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake, LogOut, User } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";

function RiderNavbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login", { state: { message: "You have been signed out successfully." } });
  };

  return (
    <header className="sticky top-4 z-50 px-4 lg:px-6 transition-all duration-300">
      <div className="mx-auto max-w-[1200px] h-[70px] rounded-full border border-cr-border px-4 md:px-5 lg:px-6 flex items-center justify-between bg-cr-card/80 backdrop-blur-[16px] shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-colors duration-300">
          {/* Logo & Mobile Menu */}
          <Link to="/dashboard/rider" className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-cr-primary flex items-center justify-center shadow-md">
              <HeartHandshake size={20} className="text-white md:w-[22px] md:h-[22px]" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-cr-text-primary">
                CareRide AI
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] rounded-full bg-cr-sage/20 text-cr-primary border border-cr-border">
                Rider
              </span>
            </div>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-3 md:gap-6">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-2 text-cr-text-muted text-sm">
              <User size={15} />
              <span>{user?.email || "user@gmail.com"}</span>
            </div>
            <button
              onClick={() => setShowSignOutModal(true)}
              className="hidden md:flex items-center gap-2 text-cr-text-muted hover:text-cr-primary transition font-medium"
            >
              <LogOut size={17} />
              Sign Out
            </button>
            <button 
              className="md:hidden p-2 text-cr-text-primary -mr-2"
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-rider-sidebar'))}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
      </div>

      {showSignOutModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-cr-card rounded-2xl shadow-xl p-6 w-full max-w-sm border border-cr-border mx-4">
            <h3 className="text-xl font-bold text-cr-text-primary mb-2">Sign Out</h3>
            <p className="text-cr-text-muted text-sm mb-6">Are you sure you want to sign out?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="px-4 py-2 rounded-xl text-cr-text-muted font-medium hover:bg-cr-surface transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-cr-primary text-white font-medium hover:bg-cr-primary-hover transition"
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

export default RiderNavbar;