import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Activity, Search, ShieldCheck, Star, XCircle } from "lucide-react";

import HelperNavbar from "../../components/dashboard/HelperNavbar";
import HelperSidebar from "../../components/dashboard/HelperSidebar";

import { getTravelRequests, acceptRide, declineHelper } from "../../services/travelService";
import { getHelpers } from "../../services/helperService";
import { getCurrentUser } from "../../services/authService";
import { getProfile } from "../../services/profileService";

export default function BrowseRequests() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [pendingRides, setPendingRides] = useState([]);
  const [priorityRides, setPriorityRides] = useState([]);
  const [helperProfile, setHelperProfile] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [profileCompleted, setProfileCompleted] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const checkProfile = async () => {
      try {
        const profile = await getProfile(user.email);
        setProfileCompleted(profile.profile_completed);
      } catch (err) {
        console.error("Error checking profile status", err);
      }
    };
    checkProfile();
    
    loadData();

    // Auto-refresh the UI every 10 seconds
    const interval = setInterval(() => {
      loadData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const helpers = await getHelpers();
      const allHelpers = helpers.results || helpers;
      const profile = allHelpers.find((h) => h.auth_user_id === user.user_id);
      setHelperProfile(profile);

      const requestsData = await getTravelRequests();
      const allRides = requestsData.results || requestsData;

      const pending = allRides.filter(
        (ride) => (ride.status === "Pending" || ride.status === "Waiting for available helper" || ride.status === "Searching for Another Helper" || ride.status === "Open Dispatch") && !ride.active_helper_ids?.includes(profile?.id)
      );
      const priority = allRides.filter(
        (ride) => 
          (ride.status === "AI Recommended" || ride.status === "Waiting for Helper Response" || ride.status === "Searching for Another Helper" || ride.status === "Urgent AI Recommended" || ride.status === "Open Dispatch") && 
          ride.active_helper_ids?.includes(profile?.id)
      );
      
      setPendingRides(pending);
      setPriorityRides(priority);
    } catch (err) {
      console.error("Error loading travel requests:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId) => {
    if (!helperProfile) return;
    setActionLoading((prev) => ({ ...prev, [rideId]: true }));
    try {
      await acceptRide(rideId);
      navigate("/helper/assigned-rides", { state: { message: "Your ride has been assigned." } });
    } catch (err) {
      console.error("Error accepting ride:", err);
      if (err.response?.status === 409) {
        setErrorMsg("This ride has already been accepted.");
        await loadData();
      } else if (err.response?.status === 403) {
        setErrorMsg(err.response.data.error || "Forbidden.");
        await loadData();
      }
      setActionLoading((prev) => ({ ...prev, [rideId]: false }));
    }
  };

  const handleDeclineRide = async (rideId) => {
    if (!helperProfile) return;
    setActionLoading((prev) => ({ ...prev, [rideId]: true }));
    try {
      // Decline helper using the new endpoint
      await declineHelper(rideId);
      await loadData();
    } catch (err) {
      console.error("Error declining ride:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [rideId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
        <HelperNavbar />
        <div className="max-w-7xl mx-auto px-6 py-6 flex-1 flex items-center justify-center">
          <p className="text-gray-500 font-medium">Loading requests...</p>
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
          
            {!profileCompleted ? (
              <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center max-w-2xl mx-auto mt-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Incomplete</h2>
                <p className="text-gray-500 mb-8">
                  Please complete your profile before accepting ride requests.
                </p>
                <button
                  onClick={() => navigate("/profile")}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition inline-block"
                >
                  Complete Profile
                </button>
              </div>
            ) : (
              <>
            {errorMsg && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{errorMsg}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setErrorMsg("")}>
                  <XCircle className="h-6 w-6 text-red-500 cursor-pointer" />
                </span>
              </div>
            )}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Search className="text-teal-600" />
                Browse Requests
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Browse available ride requests from riders requiring mobility and travel companionship.
              </p>
            </div>

            {/* PRIORITY REQUESTS SECTION */}
            {priorityRides.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Star className="text-yellow-500 fill-yellow-500" />
                  Priority Requests (AI Recommended)
                </h2>
                <div className="space-y-6">
                  {priorityRides.map((ride) => {
                    const aiRank = ride.my_recommendation?.ai_rank || 1;
                    const rankLabel = aiRank === 1 ? "🥇 Top Match" : aiRank === 2 ? "🥈 AI Recommended" : "🥉 AI Recommended";
                    
                    return (
                    <div
                      key={ride.id}
                      className="bg-white rounded-xl shadow border-2 border-yellow-400 p-6 hover:shadow-lg transition relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                        {rankLabel}
                      </div>
                      <div className="flex justify-between items-start mt-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <MapPin size={20} className="text-teal-600" />
                            {ride.pickup_location}
                            <span className="text-gray-400">→</span>
                            {ride.destination}
                          </h3>
                          <p className="text-gray-500 text-xs mt-1">Ride ID #{ride.id}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="flex items-center gap-2">
                          <Calendar size={18} className="text-teal-600" />
                          <div>
                            <p className="text-gray-500 text-xs">Travel Date</p>
                            <p className="font-semibold flex gap-2 items-center">
                              {ride.travel_date}
                              {ride.travel_time && (
                                <>
                                  <span className="text-gray-300">|</span>
                                  <span>{ride.travel_time.slice(0, 5)}</span>
                                </>
                              )}
                            </p>
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
                          <p className="text-gray-500 text-xs mb-1">Match Score</p>
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                            {ride.my_recommendation?.match_score || ride.assigned_helper?.match_score}% Match
                          </span>
                        </div>
                      </div>
                      
                      {(ride.my_recommendation?.reason || ride.assigned_helper?.reason) && (
                        <div className="mt-6">
                          <p className="text-gray-500 text-xs mb-1">AI Reason</p>
                          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 border border-blue-100">
                            {ride.my_recommendation?.reason || ride.assigned_helper?.reason}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                        <button
                          onClick={() => handleDeclineRide(ride.id)}
                          disabled={actionLoading[ride.id]}
                          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                          <XCircle size={18} />
                          {actionLoading[ride.id] ? "Processing..." : "Decline"}
                        </button>
                        <button
                          onClick={() => handleAcceptRide(ride.id)}
                          disabled={actionLoading[ride.id]}
                          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-medium transition disabled:bg-gray-300"
                        >
                          <ShieldCheck size={18} />
                          {actionLoading[ride.id] ? "Accepting..." : "Accept Ride"}
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            )}

            {/* NORMAL REQUESTS SECTION */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Available Requests</h2>
            {pendingRides.length === 0 ? (
              <div className="bg-white rounded-xl shadow border border-gray-200 p-8 text-center">
                <p className="text-gray-500 font-medium">No pending ride requests available right now.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-white rounded-xl shadow border border-gray-200 p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          <MapPin size={20} className="text-teal-600" />
                          {ride.pickup_location}
                          <span className="text-gray-400">→</span>
                          {ride.destination}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1">Ride ID #{ride.id}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
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
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 border">
                          {ride.additional_note}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                      <button
                        onClick={() => handleAcceptRide(ride.id)}
                        disabled={actionLoading[ride.id]}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-medium transition disabled:bg-gray-300"
                      >
                        <ShieldCheck size={18} />
                        {actionLoading[ride.id] ? "Accepting..." : "Accept Ride"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
