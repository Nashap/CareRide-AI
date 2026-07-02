import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Search,
  Clock,
  Star,
  ArrowRight,
  MapPin,
  Calendar,
  Activity,
  HeartHandshake
} from "lucide-react";

import HelperNavbar from "../../components/dashboard/HelperNavbar";
import HelperSidebar from "../../components/dashboard/HelperSidebar";

import { getTravelRequests } from "../../services/travelService";
import { getHelpers, createHelperProfile } from "../../services/helperService";
import { getCurrentUser } from "../../services/authService";

export default function HelperDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [helperProfile, setHelperProfile] = useState(null);
  const [stats, setStats] = useState({
    assigned: 0,
    pending: 0,
    completed: 0,
    rating: 0,
  });
  const [recentRide, setRecentRide] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // 1. Fetch or initialize Helper Profile
      const helpers = await getHelpers();
      const allHelpers = helpers.results || helpers;
      let profile = allHelpers.find((h) => h.auth_user_id === user.user_id);

      if (!profile) {
        // Create Helper profile if none exists
        profile = await createHelperProfile({
          auth_user_id: user.user_id,
          name: user.name || "Helper",
          skills: "Mobility and travel assistance",
          rating: 5.0,
          availability: true,
        });
      }
      setHelperProfile(profile);

      // 2. Fetch Travel Requests and calculate stats
      const requestsData = await getTravelRequests();
      const allRides = requestsData.results || requestsData;

      // Filter rides assigned to this helper
      const assignedRides = allRides.filter(
        (ride) => ride.assigned_helper?.id === profile.id
      );

      // Total pending travel requests globally available
      const pendingRequests = allRides.filter((ride) => ride.status === "Pending");

      // Completed rides for this helper
      const completedRides = assignedRides.filter((ride) => ride.status === "Completed");

      setStats({
        assigned: assignedRides.filter((ride) => ride.status === "Accepted").length,
        pending: pendingRequests.length,
        completed: completedRides.length,
        rating: profile.rating || 5.0,
      });

      // Get most recent active assigned ride
      const activeAssigned = assignedRides.filter((ride) => ride.status === "Accepted");
      if (activeAssigned.length > 0) {
        // Sort by id descending
        activeAssigned.sort((a, b) => b.id - a.id);
        setRecentRide(activeAssigned[0]);
      } else {
        setRecentRide(null);
      }
    } catch (err) {
      console.error("Dashboard Loading Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
        <HelperNavbar />
        <div className="max-w-7xl mx-auto px-6 py-6 flex-1 flex items-center justify-center">
          <p className="text-gray-500 font-medium">Loading Helper Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <HelperNavbar />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-8">
          <HelperSidebar />

          <main className="flex-1">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl text-white p-8 mb-8">
              <h1 className="text-3xl font-bold">Helper Dashboard</h1>
              <p className="mt-3 text-teal-100 max-w-2xl">
                Manage your assigned rides and help riders with confidence.
              </p>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {/* Assigned Rides */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Assigned Rides</p>
                    <h2 className="text-3xl font-bold mt-2">{stats.assigned}</h2>
                  </div>
                  <div className="bg-teal-100 p-4 rounded-full">
                    <Briefcase size={28} className="text-teal-600" />
                  </div>
                </div>
              </div>

              {/* Pending Requests */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending Requests</p>
                    <h2 className="text-3xl font-bold mt-2">{stats.pending}</h2>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-full">
                    <Search size={28} className="text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Completed Rides */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Completed Rides</p>
                    <h2 className="text-3xl font-bold mt-2">{stats.completed}</h2>
                  </div>
                  <div className="bg-green-100 p-4 rounded-full">
                    <Clock size={28} className="text-green-600" />
                  </div>
                </div>
              </div>

              {/* Average Rating */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Average Rating</p>
                    <h2 className="text-3xl font-bold mt-2">{stats.rating.toFixed(1)}</h2>
                  </div>
                  <div className="bg-purple-100 p-4 rounded-full">
                    <Star size={28} className="text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow p-8 mb-8">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <button
                  onClick={() => navigate("/helper/assigned-rides")}
                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl p-6 transition flex flex-col justify-between h-32 text-left"
                >
                  <Briefcase size={24} />
                  <span className="font-semibold text-sm">View Assigned Rides</span>
                </button>

                <button
                  onClick={() => navigate("/helper/browse-requests")}
                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl p-6 transition flex flex-col justify-between h-32 text-left"
                >
                  <Search size={24} />
                  <span className="font-semibold text-sm">Browse Ride Requests</span>
                </button>

                <button
                  onClick={() => navigate("/helper/availability")}
                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl p-6 transition flex flex-col justify-between h-32 text-left"
                >
                  <Clock size={24} />
                  <span className="font-semibold text-sm">Update Availability</span>
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl p-6 transition flex flex-col justify-between h-32 text-left"
                >
                  <Star size={24} />
                  <span className="font-semibold text-sm">View Profile</span>
                </button>
              </div>
            </div>

            {/* Recent Assigned Ride */}
            <div className="bg-white rounded-xl shadow p-8">
              <h2 className="text-xl font-bold mb-6">Recent Assigned Ride</h2>

              {recentRide ? (
                <div className="border rounded-xl p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <MapPin size={18} className="text-teal-600" />
                        {recentRide.pickup_location}
                        <span className="text-gray-400">→</span>
                        {recentRide.destination}
                      </h3>
                      <p className="text-gray-500 text-xs mt-1">Ride ID #{recentRide.id}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      {recentRide.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-teal-600" />
                      <div>
                        <p className="text-gray-500 text-xs">Travel Date</p>
                        <p className="font-semibold">{recentRide.travel_date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-teal-600" />
                      <div>
                        <p className="text-gray-500 text-xs">Service Type</p>
                        <p className="font-semibold">{recentRide.service_type}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs">Assistance Type</p>
                      <p className="font-semibold">{recentRide.assistance_type}</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate("/helper/assigned-rides")}
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-medium transition"
                    >
                      View Details
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border rounded-xl p-8 text-center bg-gray-50">
                  <HeartHandshake className="mx-auto text-gray-400 mb-2" size={40} />
                  <p className="text-gray-500 text-sm">No active assigned rides found.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
