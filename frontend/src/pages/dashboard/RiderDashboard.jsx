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

    <div className="min-h-screen bg-gradient-to-b from-cr-bg to-cr-surface">

      <RiderNavbar />

      <div className="w-full max-w-[1480px] mx-auto px-5 md:px-8 lg:px-10 py-8 lg:py-12">

        <div className="flex gap-8">

          <RiderSidebar />

          <main className="flex-1">

            {/* Welcome Section */}

            <div className="bg-cr-primary rounded-[32px] text-white p-8 md:p-12 mb-10 shadow-[0_20px_50px_rgba(26,63,117,0.15)] relative overflow-hidden">
              {/* Decorative element to mimic Landing page aesthetic */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>

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

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-10">

              <div className="bg-cr-card rounded-[24px] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 border border-cr-border">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-cr-accent text-sm">
                      Total Rides
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                      {stats.total}
                    </h2>

                  </div>

                  <div className="bg-cr-sage/40 p-4 rounded-full">

                    <Car
                      size={28}
                      className="text-cr-secondary"
                    />

                  </div>

                </div>

              </div>

              <div className="bg-cr-card rounded-[24px] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 border border-cr-border">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-cr-accent text-sm">
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

              <div className="bg-cr-card rounded-[24px] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 border border-cr-border">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-cr-accent text-sm">
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

            <div className="bg-cr-card rounded-[32px] shadow-xl p-8 md:p-10 mb-8 border border-cr-border">

              <h2 className="text-xl font-bold mb-6">
                Quick Actions
              </h2>

              <div className="grid md:grid-cols-2 gap-6">

                <button
                  onClick={() => navigate("/book-ride")}
                  className="group flex items-center justify-between bg-cr-primary hover:bg-cr-primary-hover text-white rounded-[24px] p-6 md:p-8 shadow-[0_8px_20px_rgba(26,63,117,0.25)] hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all duration-300 text-left w-full"
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
                  className="group flex items-center justify-between bg-cr-bg border border-cr-border hover:border-cr-primary hover:text-cr-primary text-cr-text-primary rounded-[24px] p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 text-left w-full"
                >

                  <div>

                    <h3 className="text-lg font-semibold">
                      My Rides
                    </h3>

                    <p className="text-cr-accent text-sm mt-1">
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