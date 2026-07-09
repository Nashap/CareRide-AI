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
import LoadingScreen from "../../components/common/LoadingScreen";

import { getTravelRequests, updateTravelRequest } from "../../services/travelService";
import { getHelpers, createHelperProfile } from "../../services/helperService";
import { getCurrentUser } from "../../services/authService";

export default function HelperDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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

  const handleCompleteRide = async (rideId) => {
    setActionLoading(true);
    try {
      await updateTravelRequest(rideId, { status: "Completed" });
      await loadDashboard();
    } catch (err) {
      console.error("Error completing ride:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cr-bg to-cr-surface flex flex-col">
        <HelperNavbar />
        <div className="w-full max-w-[1480px] mx-auto px-5 md:px-8 lg:px-10 py-8 lg:py-12 flex-1 flex items-center justify-center">
          <LoadingScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cr-bg to-cr-surface">
      <HelperNavbar />

      <div className="w-full max-w-[1480px] mx-auto px-5 md:px-8 lg:px-10 py-8 lg:py-12">
        <div className="flex gap-8">
          <HelperSidebar />

          <main className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-cr-primary">Helper Dashboard</h1>
                <p className="text-cr-accent text-sm mt-1">
                  Manage your assigned rides and help riders with confidence.
                </p>
              </div>
              <button
                onClick={() => navigate("/helper/availability")}
                className="group bg-cr-primary hover:bg-cr-primary-hover text-white px-6 py-3 rounded-xl font-semibold shadow-[0_8px_20px_rgba(26,63,117,0.25)] hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all duration-300 flex items-center gap-2"
              >
                <Clock size={18} />
                Update Availability
              </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {/* Assigned Rides */}
              <div className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] md:hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] transition-shadow p-6 md:p-8 border border-cr-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cr-accent text-sm">Assigned Rides</p>
                    <h2 className="text-3xl font-bold mt-2">{stats.assigned}</h2>
                  </div>
                  <div className="bg-cr-sage/40 p-4 rounded-full">
                    <Briefcase size={28} className="text-cr-secondary" />
                  </div>
                </div>
              </div>

              {/* Pending Requests */}
              <div className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] md:hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] transition-shadow p-6 md:p-8 border border-cr-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cr-accent text-sm">Pending Requests</p>
                    <h2 className="text-3xl font-bold mt-2">{stats.pending}</h2>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-full">
                    <Search size={28} className="text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Completed Rides */}
              <div className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] md:hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] transition-shadow p-6 md:p-8 border border-cr-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cr-accent text-sm">Completed Rides</p>
                    <h2 className="text-3xl font-bold mt-2">{stats.completed}</h2>
                  </div>
                  <div className="bg-green-100 p-4 rounded-full">
                    <Clock size={28} className="text-green-600" />
                  </div>
                </div>
              </div>

              {/* Average Rating */}
              <div className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] md:hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] transition-shadow p-6 md:p-8 border border-cr-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cr-accent text-sm">Average Rating</p>
                    <h2 className="text-3xl font-bold mt-2">{stats.rating.toFixed(1)}</h2>
                  </div>
                  <div className="bg-purple-100 p-4 rounded-full">
                    <Star size={28} className="text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-cr-card rounded-[32px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] md:hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] transition-shadow p-6 md:p-10 mb-8 border border-cr-border">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <button
                  onClick={() => navigate("/helper/assigned-rides")}
                  className="group flex items-center justify-between bg-cr-primary md:hover:bg-cr-primary-hover text-white rounded-[24px] p-6 md:p-8 shadow-sm md:shadow-[0_8px_20px_rgba(26,63,117,0.25)] md:hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all duration-300 text-left w-full"
                >
                  <div>
                    <h3 className="text-lg font-semibold">View Assigned Rides</h3>
                    <p className="text-teal-100 text-sm mt-1">Check your active matches.</p>
                  </div>
                  <ArrowRight size={28} />
                </button>

                <button
                  onClick={() => navigate("/helper/browse-requests")}
                  className="group flex items-center justify-between bg-cr-bg border border-cr-border md:hover:border-cr-primary md:hover:text-cr-primary text-cr-text-primary rounded-[24px] p-6 md:p-8 shadow-sm md:hover:shadow-md transition-all duration-300 text-left w-full"
                >
                  <div>
                    <h3 className="text-lg font-semibold">Browse Requests</h3>
                    <p className="text-cr-accent text-sm mt-1">Find new ride requests.</p>
                  </div>
                  <ArrowRight size={28} />
                </button>

                <button
                  onClick={() => navigate("/helper/availability")}
                  className="group flex items-center justify-between bg-cr-bg border border-cr-border md:hover:border-cr-primary md:hover:text-cr-primary text-cr-text-primary rounded-[24px] p-6 md:p-8 shadow-sm md:hover:shadow-md transition-all duration-300 text-left w-full"
                >
                  <div>
                    <h3 className="text-lg font-semibold">Availability</h3>
                    <p className="text-cr-accent text-sm mt-1">Set your online status.</p>
                  </div>
                  <ArrowRight size={28} />
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  className="group flex items-center justify-between bg-cr-bg border border-cr-border md:hover:border-cr-primary md:hover:text-cr-primary text-cr-text-primary rounded-[24px] p-6 md:p-8 shadow-sm md:hover:shadow-md transition-all duration-300 text-left w-full"
                >
                  <div>
                    <h3 className="text-lg font-semibold">Profile</h3>
                    <p className="text-cr-accent text-sm mt-1">Manage personal details.</p>
                  </div>
                  <ArrowRight size={28} />
                </button>
              </div>
            </div>

            {/* Today's Assigned Ride */}
            <div className="bg-cr-card rounded-[32px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] md:hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] transition-shadow p-6 md:p-10 border border-cr-border">
              <h2 className="text-xl font-bold mb-6">Today's Assigned Ride</h2>

              {recentRide ? (
                <div className="border border-cr-border rounded-[24px] p-6 md:p-8 md:hover:shadow-lg md:hover:-translate-y-1 transition-all duration-300 bg-cr-bg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-cr-primary flex items-center gap-2">
                        <MapPin size={20} className="text-cr-secondary" />
                        {recentRide.pickup_location}
                        <span className="text-gray-400">→</span>
                        {recentRide.destination}
                      </h2>
                      <p className="text-cr-accent text-xs mt-1">Ride ID #{recentRide.id}</p>
                    </div>

                    <span className="px-4 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      {recentRide.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-cr-secondary" />
                      <div>
                        <p className="text-cr-accent text-xs">Travel Date</p>
                        <p className="font-semibold">{recentRide.travel_date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Activity size={18} className="text-cr-secondary" />
                      <div>
                        <p className="text-cr-accent text-xs">Service Type</p>
                        <p className="font-semibold">{recentRide.service_type}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-cr-accent text-xs mb-1">Assistance Type</p>
                      <p className="font-semibold">{recentRide.assistance_type}</p>
                    </div>

                    <div>
                      <p className="text-cr-accent text-xs mb-1">Assistance Level</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                        ${
                          recentRide.assistance_level === "High"
                            ? "bg-red-100 text-red-700"
                            : recentRide.assistance_level === "Medium"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {recentRide.assistance_level}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 border-t pt-4">
                    <button
                      onClick={() => navigate("/helper/assigned-rides")}
                      className="bg-cr-card border border-cr-border md:hover:border-cr-primary md:hover:text-cr-primary text-cr-text-primary w-full sm:w-auto px-6 py-3 min-h-[48px] rounded-xl font-semibold shadow-sm md:hover:shadow-md transition-all duration-300"
                    >
                      View Details
                    </button>
                    {recentRide.status === "Accepted" && (
                      <button
                        onClick={() => handleCompleteRide(recentRide.id)}
                        disabled={actionLoading}
                        className="group bg-cr-primary md:hover:bg-cr-primary-hover text-white w-full sm:w-auto px-6 py-3 min-h-[48px] rounded-xl font-semibold md:shadow-[0_8px_20px_rgba(26,63,117,0.25)] md:hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? "Completing..." : "Complete Ride"}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border border-cr-surface rounded-xl p-8 text-center bg-cr-bg">
                  <HeartHandshake className="mx-auto text-gray-400 mb-2" size={40} />
                  <p className="text-cr-accent text-sm">No active assigned rides found for today.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
