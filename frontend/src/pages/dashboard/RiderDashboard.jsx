import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";
import EmptyState from "../../components/dashboard/EmptyState";

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
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My rides</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Track and manage your CareRide bookings.
              </p>
            </div>

            <button
              onClick={() => navigate("/book-ride")}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
            >
              <Plus size={15} />
              Book a new ride
            </button>
          </div>

          {/* Empty State */}
          <EmptyState />

        </main>

      </div>

    </div>
  );
}

export default RiderDashboard;
