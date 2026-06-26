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
    <header className="bg-white border-t-4 border-t-gray-900 border-b border-b-gray-200 px-8 py-3 flex justify-between items-center">

      {/* Logo */}
      <div className="flex items-center gap-2">
        {/* Teal circle icon */}
        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">✦</span>
        </div>

        <span className="font-bold text-gray-900 text-base">CareRide</span>
        <span className="font-normal text-gray-900 text-base">AI</span>

        <span className="ml-1 bg-teal-50 border border-teal-300 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full">
          Rider
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>{user?.email ?? "nashanoushad16@gmail.com"}</span>

        {/* Avatar circle (cloud shape placeholder) */}
        <div className="w-9 h-7 bg-gray-100 border border-gray-300 rounded-full" />

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
