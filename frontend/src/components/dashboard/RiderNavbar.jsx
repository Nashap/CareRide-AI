import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function RiderNavbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-teal-600 font-bold text-base">✦ CareRide</span>
        <span className="text-teal-600 text-sm font-semibold">AI</span>
        <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
          Rider
        </span>
      </div>

      {/* Right: email + sign out */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>{user?.email ?? "nasharioushaid19@gmail.com"}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>

    </header>
  );
}

export default RiderNavbar;
