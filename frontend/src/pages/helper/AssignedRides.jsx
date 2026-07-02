import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Activity, CheckCircle, Briefcase } from "lucide-react";

import HelperNavbar from "../../components/dashboard/HelperNavbar";
import HelperSidebar from "../../components/dashboard/HelperSidebar";

import { getTravelRequests, updateTravelRequest } from "../../services/travelService";
import { getHelpers } from "../../services/helperService";
import { getCurrentUser } from "../../services/authService";

export default function AssignedRides() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [helperProfile, setHelperProfile] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const helpers = await getHelpers();
      const allHelpers = helpers.results || helpers;
      const profile = allHelpers.find((h) => h.auth_user_id === user.user_id);
      setHelperProfile(profile);

      if (profile) {
        const requestsData = await getTravelRequests();
        const allRides = requestsData.results || requestsData;

        // Filter rides assigned to this helper
        const assignedRides = allRides.filter(
          (ride) => ride.assigned_helper?.id === profile.id
        );
        setRides(assignedRides);
      }
    } catch (err) {
      console.error("Error loading assigned rides:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRide = async (rideId) => {
    setActionLoading((prev) => ({ ...prev, [rideId]: true }));
    try {
      await updateTravelRequest(rideId, { status: "Completed" });
      await loadData();
    } catch (err) {
      console.error("Error completing ride:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [rideId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
        <HelperNavbar />
        <div className="max-w-7xl mx-auto px-6 py-6 flex-1 flex items-center justify-center">
          <p className="text-gray-500 font-medium">Loading assigned rides...</p>
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
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="text-teal-600" />
                Assigned Rides
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                View your active matches and complete rides to assist elderly riders.
              </p>
            </div>

            {rides.length === 0 ? (
              <div className="bg-white rounded-xl shadow border border-gray-200 p-8 text-center">
                <p className="text-gray-500 font-medium">No rides assigned to you yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {rides.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-white rounded-xl shadow border border-gray-200 p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          <MapPin size={20} className="text-teal-600" />
                          {ride.pickup_location}
                          <span className="text-gray-400">→</span>
                          {ride.destination}
                        </h2>
                        <p className="text-gray-500 text-xs mt-1">Ride ID #{ride.id}</p>
                      </div>

                      <span
                        className={`px-4 py-1 rounded-full text-sm font-medium
                        ${
                          ride.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : ride.status === "Accepted"
                            ? "bg-green-100 text-green-700"
                            : ride.status === "Completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {ride.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-teal-600" />
                        <div>
                          <p className="text-gray-500 text-xs">Travel Date</p>
                          <p className="font-semibold">{ride.travel_date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Activity size={18} className="text-teal-600" />
                        <div>
                          <p className="text-gray-500 text-xs">Service Type</p>
                          <p className="font-semibold">{ride.service_type}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-500 text-xs mb-1">Assistance Type</p>
                        <p className="font-semibold">{ride.assistance_type}</p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-xs mb-1">Assistance Level</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                          ${
                            ride.assistance_level === "High"
                              ? "bg-red-100 text-red-700"
                              : ride.assistance_level === "Medium"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {ride.assistance_level}
                        </span>
                      </div>
                    </div>

                    {ride.additional_note && (
                      <div className="mt-6">
                        <p className="text-gray-500 text-xs mb-1">Additional Notes</p>
                        <div className="bg-gray-50 rounded-lg p-4 border text-sm text-gray-700">
                          {ride.additional_note}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                      {ride.status === "Accepted" && (
                        <button
                          onClick={() => handleCompleteRide(ride.id)}
                          disabled={actionLoading[ride.id]}
                          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-medium transition disabled:bg-gray-300"
                        >
                          <CheckCircle size={18} />
                          {actionLoading[ride.id] ? "Completing..." : "Complete Ride"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
