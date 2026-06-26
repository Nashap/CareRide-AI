import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";
import DashboardCard from "../../components/dashboard/DashboardCard";
import EmptyState from "../../components/dashboard/EmptyState";

function RiderDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <RiderSidebar />

      {/* Right Section */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <RiderNavbar />

        {/* Dashboard Content */}
        <main className="flex-1 p-8 overflow-y-auto">

          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">

            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                My Rides
              </h1>

              <p className="text-gray-500 mt-2">
                Welcome to CareRide AI. Manage your rides and book new journeys with confidence.
              </p>
            </div>

            <button
              onClick={() => navigate("/book-ride")}
              className="
                mt-5
                lg:mt-0
                flex
                items-center
                gap-2
                bg-teal-500
                hover:bg-teal-600
                text-white
                px-6
                py-3
                rounded-xl
                font-semibold
                transition
              "
            >
              <Plus size={20} />
              Book a Ride
            </button>

          </div>

          {/* Statistics */}
          <DashboardCard />

          {/* Empty State */}
          <EmptyState />

        </main>

      </div>

    </div>
  );
}

export default RiderDashboard;