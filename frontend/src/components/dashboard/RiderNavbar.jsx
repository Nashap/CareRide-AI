import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function RiderNavbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between">

      {/* Left */}
      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
          CR
        </div>

        <h1 className="text-xl font-bold text-gray-800">
          CareRide AI
        </h1>

        <span className="bg-teal-100 text-teal-700 text-xs font-medium px-3 py-1 rounded-full">
          Rider
        </span>

      </div>

      {/* Right */}
      <div className="flex items-center gap-6">

        <p className="text-sm text-gray-500 hidden md:block">
          {user?.email || "rider@email.com"}
        </p>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">
            Sign Out
          </span>
        </button>

      </div>

    </header>
  );
}

export default RiderNavbar;