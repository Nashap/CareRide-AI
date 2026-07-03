import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Star,
  CheckCircle,
  MapPin,
  Calendar,
  User,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle
} from "lucide-react";

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";

import { getRecommendation } from "../../services/aiService";

import { getTravelRequest, acceptHelper } from "../../services/travelService";
import { getCurrentUser } from "../../services/authService";
import { getProfile } from "../../services/profileService";

export default function AIRecommendation() {
  const { travelRequestId } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [loadingHelperId, setLoadingHelperId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileCompleted, setProfileCompleted] = useState(true);

  const [travelRequest, setTravelRequest] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

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
  }, [travelRequestId]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch Travel Request context
      const requestData = await getTravelRequest(travelRequestId);
      setTravelRequest(requestData);

      // 2. Fetch AI Recommendation
      const recData = await getRecommendation(travelRequestId);
      setRecommendation(recData);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to load AI recommendations. Make sure the backend service and database are configured correctly."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptHelper = async (helperId, reason) => {
    setLoadingHelperId(helperId);
    setError("");
    setSuccess("");

    try {
      await acceptHelper(travelRequestId, helperId, reason);
      setSuccess("Your request has been sent to the selected helper.");
      setTimeout(() => {
        navigate("/my-rides");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to accept the helper.");
      setLoadingHelperId(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 70) return "text-teal-600 bg-teal-50 border-teal-200";
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <RiderNavbar />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-8">
          <RiderSidebar />

          <main className="flex-1">
          
            {!profileCompleted ? (
              <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center max-w-2xl mx-auto mt-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Incomplete</h2>
                <p className="text-gray-500 mb-8">
                  Please complete your profile before booking your first ride.
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
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="text-teal-600" />
                AI Recommended Helper
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Our Gemini AI analyzed your ride requirements to match you with the best available helper.
              </p>
            </div>

            {success && (
              <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 flex items-center gap-3">
                <CheckCircle className="text-emerald-600 flex-shrink-0" />
                <span className="font-medium">{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-800 p-4 flex items-center gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Error Loading Recommendations</h4>
                  <p className="text-sm text-red-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-teal-600 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-800">Analyzing matching helpers...</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-sm">
                  We are querying the database and running Gemini 2.5 Flash algorithms to match requirements, assistance levels, and helper ratings.
                </p>
              </div>
            ) : (
              <>
                {/* Trip Context Card */}
                {travelRequest && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h2 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <MapPin size={18} className="text-teal-600" />
                      Your Requested Trip Details
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <span className="text-gray-400 block uppercase tracking-wider text-xs font-semibold">Route</span>
                        <p className="font-semibold text-gray-800 mt-1 flex items-center gap-1.5">
                          {travelRequest.pickup_location}
                          <ArrowRight size={14} className="text-gray-400" />
                          {travelRequest.destination}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 block uppercase tracking-wider text-xs font-semibold">Service & Date</span>
                        <p className="font-semibold text-gray-800 mt-1 flex items-center gap-1.5">
                          <Calendar size={14} className="text-teal-600" />
                          {travelRequest.travel_date} | {travelRequest.service_type}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 block uppercase tracking-wider text-xs font-semibold">Assistance Level Required</span>
                        <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold
                          ${travelRequest.assistance_level === "High" ? "bg-red-50 text-red-700 border border-red-100" :
                            travelRequest.assistance_level === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}
                        >
                          {travelRequest.assistance_level} Assistance ({travelRequest.assistance_type})
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Summary Banner */}
                {recommendation?.summary && (
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-6 mb-8 shadow-sm">
                    <h3 className="text-teal-900 font-semibold flex items-center gap-2">
                      <Sparkles size={18} className="text-teal-600 animate-pulse" />
                      AI Match Assessment Summary
                    </h3>
                    <p className="text-teal-800 text-sm mt-2 leading-relaxed">
                      {recommendation.summary}
                    </p>
                  </div>
                )}

                {/* Recommendations Grid */}
                {recommendation?.recommended_helpers?.length > 0 ? (
                  <div className="space-y-6">
                    {recommendation.recommended_helpers.map((rh, index) => (
                      <div
                        key={rh.helper_id || index}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition duration-300 flex flex-col md:flex-row"
                      >
                        {/* Match Score Block */}
                        <div className="md:w-48 bg-gray-50 p-6 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-150">
                          <div className={`w-24 h-24 rounded-full border-2 flex flex-col justify-center items-center font-bold ${getScoreColor(rh.match_score)}`}>
                            <span className="text-3xl">{rh.match_score}%</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-0.5">Match</span>
                          </div>
                          <span className="text-xs text-gray-500 font-medium mt-3 flex items-center gap-1">
                            <Sparkles size={12} className="text-amber-500" />
                            Rank #{index + 1} Recommendation
                          </span>
                        </div>

                        {/* Helper Info Block */}
                        <div className="flex-1 p-8">
                          <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <User className="text-gray-400" size={20} />
                                {rh.name}
                              </h3>
                              <div className="flex items-center gap-1 mt-1 text-amber-500">
                                <Star size={16} fill="currentColor" />
                                <span className="text-sm font-semibold text-gray-700">{rh.rating.toFixed(1)}</span>
                                <span className="text-gray-300 text-xs">|</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rh.availability ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                  {rh.availability ? "Available" : "Unavailable"}
                                </span>
                              </div>
                            </div>

                            {travelRequest.status === "Expired" ? (
                              <span className="text-gray-500 font-medium italic">This ride has expired.</span>
                            ) : (
                              <button
                                onClick={() => handleAcceptHelper(rh.helper_id, rh.reason)}
                                disabled={(loadingHelperId !== null) || !rh.availability}
                                className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition shadow-sm
                                  ${!rh.availability || (loadingHelperId !== null && loadingHelperId !== rh.helper_id) ? "bg-gray-100 text-gray-400 cursor-not-allowed border" :
                                    "bg-teal-600 hover:bg-teal-700 text-white hover:shadow"}`}
                              >
                                {loadingHelperId === rh.helper_id ? "Confirming..." : "Accept Helper"}
                              </button>
                            )}
                          </div>

                          <div className="mb-6">
                            <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Assisted Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {rh.skills.split(",").map((skill, i) => (
                                <span key={i} className="bg-gray-100 text-gray-700 border text-xs px-3 py-1 rounded-full font-medium">
                                  {skill.trim()}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-teal-50/50 border border-teal-100/50 rounded-xl p-4">
                            <h4 className="text-xs uppercase tracking-wider text-teal-800 font-bold flex items-center gap-1.5 mb-1.5">
                              <ShieldCheck size={14} className="text-teal-600" />
                              Why this helper matches your request:
                            </h4>
                            <p className="text-sm text-teal-900 leading-relaxed">
                              {rh.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center flex flex-col items-center">
                    <AlertCircle size={48} className="text-amber-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800">No Matched Helpers Recommended</h3>
                    <p className="text-gray-500 text-sm mt-2 max-w-sm">
                      We couldn't generate matches. This can occur if there are no available helpers marked as active, or if your requested assistance level requires specialized skills.
                    </p>
                    <div className="mt-6 flex gap-4">
                      <button
                        onClick={() => navigate("/helpers")}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-sm"
                      >
                        Browse All Helpers
                      </button>
                      <button
                        onClick={() => navigate("/dashboard/rider")}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition border"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Navigation */}
                {recommendation?.recommended_helpers?.length > 0 && (
                  <div className="mt-8 flex justify-between items-center bg-white rounded-2xl border border-gray-200 p-6">
                    <span className="text-sm text-gray-500">
                      Not satisfied with the AI recommendation?
                    </span>
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate("/helpers")}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-3 rounded-xl transition border"
                      >
                        Browse All Helpers
                      </button>
                      <button
                        onClick={() => navigate("/dashboard/rider")}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-3 rounded-xl transition border"
                      >
                        Back to Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            
            </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
