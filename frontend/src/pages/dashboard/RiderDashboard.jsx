import {
  Plus,
  Car,
  Clock,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";

import { getTravelRequests } from "../../services/travelService";
import { getCurrentUser } from "../../services/authService";

export default function RiderDashboard() {

  const navigate = useNavigate();

  const user = getCurrentUser();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
  });

  useEffect(() => {

    loadDashboard();

  }, []);

  const loadDashboard = async () => {

    try {

      const response = await getTravelRequests();

      const rides = response.results || response;

      const myRides = rides.filter(
        (ride) => ride.rider === user.id
      );

      setStats({

        total: myRides.length,

        pending: myRides.filter(
          (r) => r.status === "Pending"
        ).length,

        completed: myRides.filter(
          (r) => r.status === "Completed"
        ).length,

      });

    } catch (err) {

      console.error(err);

    }

  };
    return (

    <div className="min-h-screen bg-[#F5F0E8]">

      <RiderNavbar />

      <div className="max-w-7xl mx-auto px-6 py-6">

        <div className="flex gap-8">

          <RiderSidebar />

          <main className="flex-1">

            {/* Welcome Section */}

            <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl text-white p-8 mb-8">

              <h1 className="text-3xl font-bold">
                Welcome back, {user?.name || "Rider"}! 👋
              </h1>

              <p className="mt-3 text-teal-100 max-w-2xl">
                Everything you need is right here. Book a ride,
                monitor your travel requests, and access personalized
                assistance through CareRide.
              </p>

            </div>

            {/* Statistics */}

            <div className="grid md:grid-cols-3 gap-6 mb-8">

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Total Rides
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                      {stats.total}
                    </h2>

                  </div>

                  <div className="bg-teal-100 p-4 rounded-full">

                    <Car
                      size={28}
                      className="text-teal-600"
                    />

                  </div>

                </div>

              </div>

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Pending
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                      {stats.pending}
                    </h2>

                  </div>

                  <div className="bg-yellow-100 p-4 rounded-full">

                    <Clock
                      size={28}
                      className="text-yellow-600"
                    />

                  </div>

                </div>

              </div>

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Completed
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                      {stats.completed}
                    </h2>

                  </div>

                  <div className="bg-green-100 p-4 rounded-full">

                    <CheckCircle
                      size={28}
                      className="text-green-600"
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* Quick Actions */}

            <div className="bg-white rounded-xl shadow p-8 mb-8">

              <h2 className="text-xl font-bold mb-6">
                Quick Actions
              </h2>

              <div className="grid md:grid-cols-2 gap-6">

                <button
                  onClick={() => navigate("/book-ride")}
                  className="flex items-center justify-between bg-teal-600 hover:bg-teal-700 text-white rounded-xl p-6 transition"
                >

                  <div>

                    <h3 className="text-lg font-semibold">
                      Book a Ride
                    </h3>

                    <p className="text-teal-100 text-sm mt-1">
                      Create a new travel request.
                    </p>

                  </div>

                  <Plus size={28} />

                </button>

                <button
                  onClick={() => navigate("/my-rides")}
                  className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded-xl p-6 transition"
                >

                  <div>

                    <h3 className="text-lg font-semibold">
                      My Rides
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      View and manage your bookings.
                    </p>

                  </div>

                  <ArrowRight size={28} />

                </button>

              </div>

            </div>

          </main>

        </div>

      </div>

    </div>

  );
}