import { LogOut, User } from "lucide-react";
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
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
          CR
        </div>

        <div>
          <h1 className="font-bold text-xl text-gray-800">
            CareRide AI
          </h1>

          <p className="text-xs text-gray-500">
            Rider Dashboard
          </p>
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-6">

        <div className="hidden md:flex items-center gap-2 text-gray-700">
          <User size={18} />

          <span className="text-sm">
            {user?.email}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="
            flex
            items-center
            gap-2
            bg-red-500
            hover:bg-red-600
            text-white
            px-4
            py-2
            rounded-lg
            transition
          "
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </header>
  );
}

export default RiderNavbar;