import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Activity, Search, ShieldCheck, Star, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import HelperNavbar from "../../components/dashboard/HelperNavbar";
import HelperSidebar from "../../components/dashboard/HelperSidebar";
import LoadingScreen from "../../components/common/LoadingScreen";

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

  const loadData = async (showLoading = true) => {
    await Promise.resolve();
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
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();

    // Auto-refresh the UI every 10 seconds
    const interval = setInterval(() => {
      loadData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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
          
            {!profileCompleted ? (
              <div className="bg-cr-card rounded-[32px] shadow-xl border border-cr-border p-12 text-center max-w-2xl mx-auto mt-10">
                <h2 className="text-2xl font-bold text-cr-primary mb-4">Profile Incomplete</h2>
                <p className="text-cr-accent mb-8">
                  Please complete your profile before accepting ride requests.
                </p>
                <button
                  onClick={() => navigate("/profile")}
                  className="group bg-cr-primary hover:bg-cr-primary-hover text-white px-8 py-4 rounded-xl font-semibold shadow-[0_8px_20px_rgba(26,63,117,0.25)] hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all duration-300 inline-block"
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
              <h1 className="text-3xl font-bold text-cr-primary flex items-center gap-2">
                <Search className="text-cr-secondary" />
                Browse Requests
              </h1>
              <p className="text-cr-accent text-sm mt-1">
                Browse available ride requests from riders requiring mobility and travel companionship.
              </p>
            </div>

            {/* PRIORITY REQUESTS SECTION */}
            {priorityRides.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-cr-primary flex items-center gap-2 mb-4">
                  <Star className="text-yellow-500 fill-yellow-500" />
                  Priority Requests (AI Recommended)
                </h2>
                <motion.div 
                  className="space-y-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
                  }}
                >
                  {priorityRides.map((ride) => {
                    const aiRank = ride.my_recommendation?.ai_rank || 1;
                    const rankLabel = aiRank === 1 ? "🥇 Top Match" : aiRank === 2 ? "🥈 AI Recommended" : "🥉 AI Recommended";
                    
                    return (
                    <motion.div
                      key={ride.id}
                      variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                      }}
                      className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(250,204,21,0.15)] hover:shadow-[0_12px_40px_rgba(250,204,21,0.25)] p-8 md:p-10 border-2 border-yellow-400 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                        {rankLabel}
                      </div>
                      <div className="flex justify-between items-start mt-2">
                        <div>
                          <h3 className="text-xl font-bold text-cr-primary flex items-center gap-2">
                            <MapPin size={20} className="text-cr-secondary" />
                            {ride.pickup_location}
                            <span className="text-gray-400">→</span>
                            {ride.destination}
                          </h3>
                          <p className="text-cr-accent text-xs mt-1">Ride ID #{ride.id}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="flex items-center gap-2">
                          <Calendar size={18} className="text-cr-secondary" />
                          <div>
                            <p className="text-cr-accent text-xs">Travel Date</p>
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
                          <Activity size={18} className="text-cr-secondary" />
                          <div>
                            <p className="text-cr-accent text-xs">Service Type</p>
                            <p className="font-semibold">{ride.service_type}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-cr-accent text-xs mb-1">Assistance Type</p>
                          <p className="font-semibold">{ride.assistance_type}</p>
                        </div>
                        
                        <div>
                          <p className="text-cr-accent text-xs mb-1">Match Score</p>
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                            {ride.my_recommendation?.match_score || ride.assigned_helper?.match_score}% Match
                          </span>
                        </div>
                      </div>
                      
                      {(ride.my_recommendation?.reason || ride.assigned_helper?.reason) && (
                        <div className="mt-6">
                          <p className="text-cr-accent text-xs mb-1">AI Reason</p>
                          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 border border-blue-100">
                            {ride.my_recommendation?.reason || ride.assigned_helper?.reason}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                        <button
                          onClick={() => handleDeclineRide(ride.id)}
                          disabled={actionLoading[ride.id]}
                          className="bg-cr-card border border-cr-border hover:border-cr-primary hover:text-cr-primary text-cr-text-primary px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                        {actionLoading[ride.id] ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Declining...
                          </>
                        ) : (
                          <>
                            <XCircle size={18} />
                            Decline
                          </>
                        )}
                      </button>
                        <button
                          onClick={() => handleAcceptRide(ride.id)}
                          disabled={actionLoading[ride.id]}
                          className="group bg-cr-primary hover:bg-cr-primary-hover text-white px-6 py-3 rounded-xl font-semibold shadow-[0_8px_20px_rgba(26,63,117,0.25)] hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                        {actionLoading[ride.id] ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={18} />
                            Accept Ride
                          </>
                        )}
                      </button>
                      </div>
                    </motion.div>
                  )})}
                </motion.div>
              </div>
            )}

            {/* NORMAL REQUESTS SECTION */}
            <h2 className="text-xl font-bold text-cr-primary mb-4">Available Requests</h2>
            {pendingRides.length === 0 ? (
              <div className="bg-cr-card rounded-[32px] shadow-xl p-8 md:p-10 border border-cr-border text-center">
                <p className="text-cr-accent font-medium">No pending ride requests available right now.</p>
              </div>
            ) : (
              <motion.div 
                className="space-y-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
                }}
              >
                {pendingRides.map((ride) => (
                  <motion.div
                    key={ride.id}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                    }}
                    className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] p-8 md:p-10 border border-cr-border hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-cr-primary flex items-center gap-2">
                          <MapPin size={20} className="text-cr-secondary" />
                          {ride.pickup_location}
                          <span className="text-gray-400">→</span>
                          {ride.destination}
                        </h3>
                        <p className="text-cr-accent text-xs mt-1">Ride ID #{ride.id}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        {ride.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-cr-secondary" />
                        <div>
                          <p className="text-cr-accent text-xs">Travel Date</p>
                          <p className="font-semibold">{ride.travel_date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Activity size={18} className="text-cr-secondary" />
                        <div>
                          <p className="text-cr-accent text-xs">Service Type</p>
                          <p className="font-semibold">{ride.service_type}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-cr-accent text-xs mb-1">Assistance Type</p>
                        <p className="font-semibold">{ride.assistance_type}</p>
                      </div>

                      <div>
                        <p className="text-cr-accent text-xs mb-1">Assistance Level</p>
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
                        <p className="text-cr-accent text-xs mb-1">Additional Notes</p>
                        <div className="bg-cr-bg rounded-lg p-4 text-sm text-cr-secondary border">
                          {ride.additional_note}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                      <button
                        onClick={() => handleAcceptRide(ride.id)}
                        disabled={actionLoading[ride.id]}
                        className="group bg-cr-primary hover:bg-cr-primary-hover text-white px-6 py-3 rounded-xl font-semibold shadow-[0_8px_20px_rgba(26,63,117,0.25)] hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {actionLoading[ride.id] ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={18} />
                            Accept Ride
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
