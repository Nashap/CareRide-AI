import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";
import EmptyRide from "../../components/dashboard/EmptyRide";

function RiderDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F6ED]">

      {/* Top Navbar */}
      <RiderNavbar />

      <div className="flex">

        {/* Sidebar */}
        <RiderSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">

            <div>

              <h1 className="text-4xl font-bold text-gray-800">
                My Rides
              </h1>

              <p className="text-gray-500 mt-2">
                Track and manage your CareRide bookings.
              </p>

            </div>

            <button
              onClick={() => navigate("/book-ride")}
              className="
                flex
                items-center
                gap-2
                bg-teal-600
                hover:bg-teal-700
                text-white
                px-6
                py-3
                rounded-lg
                font-medium
                transition
              "
            >
              <Plus size={18} />
              Book a New Ride
            </button>

          </div>

          {/* Empty Ride */}
          <EmptyRide />

        </main>

      </div>

    </div>
  );
}

export default RiderDashboard;