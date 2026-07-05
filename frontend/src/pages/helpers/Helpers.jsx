import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Star,
  Sparkles,
  CheckCircle,
  XCircle,
  Phone,
  User,
  ArrowRight,
  ShieldCheck,
  Check
} from "lucide-react";

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";
import LoadingScreen from "../../components/common/LoadingScreen";

import { getHelpers } from "../../services/helperService";
import { getRecommendation } from "../../services/aiService";
import { getTravelRequests, acceptHelper } from "../../services/travelService";
import { getCurrentUser } from "../../services/authService";

export default function Helpers() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [helpers, setHelpers] = useState([]);
  
  // AI Recommended Helper state
  const [latestRequest, setLatestRequest] = useState(null);
  const [aiRecommendedHelper, setAiRecommendedHelper] = useState(null);
  const [acceptingAiHelper, setAcceptingAiHelper] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  // Status/Error messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch all helpers
      const helperList = await getHelpers();
      setHelpers(helperList.results || helperList);

      // 2. Fetch travel requests to find the latest pending one for AI Recommendation
      const requests = await getTravelRequests();
      const allRides = requests.results || requests;
      const myRides = allRides.filter((ride) => ride.rider === user.id);
      
      if (myRides.length > 0) {
        // Sort descending by id to get the latest
        const sortedRides = [...myRides].sort((a, b) => b.id - a.id);
        const latest = sortedRides[0];
        
        if (latest && latest.status === "Pending") {
          setLatestRequest(latest);
          
          // Try to fetch AI recommendation for this latest pending request
          try {
            const rec = await getRecommendation(latest.id);
            if (rec && rec.recommended_helpers && rec.recommended_helpers.length > 0) {
              // Take the helper with the highest match score (first one)
              setAiRecommendedHelper(rec.recommended_helpers[0]);
            }
          } catch (e) {
            console.log("No existing AI recommendation for travel request ID:", latest.id);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load helpers list. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptHelper = async (helperId, reason) => {
    if (!latestRequest) return;
    setAcceptingAiHelper(true);
    setError("");
    setSuccess("");
    try {
      await acceptHelper(latestRequest.id, helperId, reason);
      setSuccess("Successfully matched with the AI recommended helper!");
      setTimeout(() => {
        navigate("/my-rides");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to accept the helper.");
      setAcceptingAiHelper(false);
    }
  };

  // Filter helpers
  const filteredHelpers = helpers.filter((helper) => {
    const matchesSearch =
      helper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      helper.skills.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAvailability = availableOnly ? helper.availability === true : true;
    
    return matchesSearch && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-cr-bg to-cr-surface">
      <RiderNavbar />

      <div className="w-full max-w-[1480px] mx-auto px-5 md:px-8 lg:px-10 py-8 lg:py-12">
        <div className="flex gap-8">
          <RiderSidebar />

          <main className="flex-1">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-cr-primary flex items-center gap-2">
                  <Users className="text-cr-secondary" />
                  Browse Helpers
                </h1>
                <p className="text-cr-accent text-sm mt-1">
                  View, filter, and search professional CareRide helpers available for mobility support.
                </p>
              </div>

              {/* Search & Toggle Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name or skill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-cr-card border border-cr-surface rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cr-secondary w-60"
                  />
                </div>
                <label className="flex items-center gap-2 bg-cr-card px-4 py-2.5 rounded-xl border border-cr-surface cursor-pointer hover:bg-cr-bg transition text-sm select-none">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={() => setAvailableOnly(!availableOnly)}
                    className="accent-teal-600 rounded"
                  />
                  <span>Available only</span>
                </label>
              </div>
            </div>

            {success && (
              <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 flex items-center gap-3">
                <CheckCircle className="text-emerald-600 flex-shrink-0" />
                <span className="font-medium">{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-800 p-4 flex items-center gap-3">
                <XCircle className="text-red-600 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {loading ? (
              <div className="bg-cr-card rounded-[32px] shadow-xl p-8 md:p-10 border border-cr-border flex items-center justify-center min-h-[400px]">
                <LoadingScreen />
              </div>
            ) : (
              <div className="space-y-8">
                {/* 1. AI Recommended Helper section (if exists) */}
                {aiRecommendedHelper && (
                  <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-2 border-cr-secondary rounded-[32px] shadow-xl p-8 md:p-10 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4 border-b border-teal-100 pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-cr-secondary text-white text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Sparkles size={12} />
                          ⭐ AI Recommended
                        </span>
                        <span className="text-xs text-cr-accent font-medium">
                          Matched for travel request #{latestRequest?.id}
                        </span>
                      </div>
                      <div className="bg-cr-secondary text-white font-bold text-xs px-3 py-1 rounded-full">
                        {aiRecommendedHelper.match_score}% Match Score
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-cr-primary flex items-center gap-2">
                          {aiRecommendedHelper.name}
                          <span className="flex items-center gap-1 text-amber-500 text-sm font-semibold bg-cr-card px-2 py-0.5 rounded-lg shadow-sm border border-cr-surface">
                            <Star size={14} fill="currentColor" />
                            {aiRecommendedHelper.rating.toFixed(1)}
                          </span>
                        </h3>
                        <p className="text-sm text-cr-secondary mt-2 font-medium">
                          Skills:{" "}
                          <span className="text-cr-primary">
                            {aiRecommendedHelper.skills}
                          </span>
                        </p>
                        {aiRecommendedHelper.reason && (
                          <div className="mt-4 bg-cr-card/70 border border-teal-100/50 rounded-xl p-4">
                            <p className="text-xs font-bold text-cr-primary uppercase tracking-wider flex items-center gap-1.5 mb-1">
                              <ShieldCheck size={14} className="text-cr-secondary" />
                              AI Match Assessment:
                            </p>
                            <p className="text-sm text-teal-950 italic">
                              "{aiRecommendedHelper.reason}"
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <button
                          onClick={() =>
                            handleAcceptHelper(
                              aiRecommendedHelper.helper_id,
                              aiRecommendedHelper.reason
                            )
                          }
                          disabled={acceptingAiHelper || !aiRecommendedHelper.availability}
                          className={`font-semibold px-6 py-3 rounded-xl transition shadow-sm w-full md:w-48 text-center
                            ${
                              !aiRecommendedHelper.availability
                                ? "bg-cr-bg text-gray-400 cursor-not-allowed border border-cr-border"
                                : "group bg-cr-primary hover:bg-cr-primary-hover text-white shadow-[0_8px_20px_rgba(26,63,117,0.25)] hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)]"
                            }`}
                        >
                          {acceptingAiHelper ? "Matching..." : "Accept AI Recommended"}
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/ai-recommendation/${latestRequest?.id}`)
                          }
                          className="bg-cr-card border border-cr-border hover:border-cr-primary hover:text-cr-primary text-cr-text-primary font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md text-center text-sm w-full md:w-48"
                        >
                          View Matching Summary
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. All Helpers section */}
                <div>
                  <h2 className="text-xl font-bold text-cr-primary mb-6 flex items-center gap-2">
                    All CareRide Helpers
                    <span className="bg-gray-200 text-cr-secondary font-semibold text-xs px-2 py-0.5 rounded-full">
                      {filteredHelpers.length}
                    </span>
                  </h2>

                  {filteredHelpers.length === 0 ? (
                    <div className="bg-cr-card rounded-[32px] shadow-xl p-8 md:p-10 border border-cr-border text-center">
                      <p className="text-cr-accent font-medium">No helpers matched your filters.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredHelpers.map((helper) => (
                        <div
                          key={helper.id}
                          className="bg-cr-card rounded-[32px] shadow-xl p-8 border border-cr-border flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg font-bold text-cr-primary flex items-center gap-2">
                                <User size={18} className="text-gray-400" />
                                {helper.name}
                              </h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                                ${
                                  helper.availability
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : "bg-red-50 text-red-700 border border-red-100"
                                }`}
                              >
                                {helper.availability ? "Available" : "Unavailable"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-amber-500 mb-4">
                              <Star size={16} fill="currentColor" />
                              <span className="text-sm font-semibold text-cr-secondary">
                                {helper.rating.toFixed(1)}
                              </span>
                              <span className="text-gray-300 text-xs">|</span>
                              <span className="text-xs text-cr-accent">CareRide Verified</span>
                            </div>

                            <div className="mb-4">
                              <span className="text-xs text-gray-400 font-bold block mb-1 uppercase">
                                Skills
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {helper.skills.split(",").map((skill, index) => (
                                  <span
                                    key={index}
                                    className="bg-cr-bg text-cr-secondary border text-xs px-2 py-0.5 rounded font-medium"
                                  >
                                    {skill.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="border-t pt-4 mt-2 flex items-center justify-between text-sm text-cr-accent">
                            <span className="flex items-center gap-1.5">
                              <Phone size={14} className="text-cr-secondary" />
                              Contact via app
                            </span>
                            
                            {latestRequest && helper.availability && (
                              <button
                                onClick={() => handleAcceptHelper(helper.id, "Manually selected from directory")}
                                className="text-cr-primary hover:text-cr-primary-hover font-bold flex items-center gap-1 group-hover:gap-2 transition-all"
                              >
                                Match Request
                                <ArrowRight size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
