import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";
import EmptyState from "../../components/dashboard/EmptyState";

function RiderDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* Navbar */}
      <RiderNavbar />

      {/* Same container style as Home page */}
      <div className="max-w-7xl mx-auto px-6 py-6">

        <div className="flex gap-8">

          {/* Sidebar */}
          <RiderSidebar />

          {/* Main Content */}
          <main className="flex-1">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  My rides
                </h1>

                <p className="text-gray-500 text-sm mt-1">
                  Track and manage your CareRide bookings.
                </p>
              </div>

              <button
                onClick={() => navigate("/book-ride")}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-lg font-medium transition"
              >
                <Plus size={18} />
                Book a new ride
              </button>

            </div>

            {/* Empty State */}
            <EmptyState />

          </main>

        </div>

      </div>

    </div>
  );
}

export default RiderDashboard;