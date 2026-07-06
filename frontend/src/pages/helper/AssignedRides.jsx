import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, MapPin, Activity, CheckCircle, Briefcase, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import HelperNavbar from "../../components/dashboard/HelperNavbar";
import HelperSidebar from "../../components/dashboard/HelperSidebar";

import { getTravelRequests, completeRide, getRideCertificate } from "../../services/travelService";
import { getHelpers } from "../../services/helperService";
import { getCurrentUser } from "../../services/authService";
import Toast from "../../components/common/Toast";
import LoadingScreen from "../../components/common/LoadingScreen";

export default function AssignedRides() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const [toastMessage, setToastMessage] = useState(location.state?.message || null);

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

        // Filter rides assigned to this helper that are actually Assigned
        const assignedRides = allRides.filter(
          (ride) => 
            ride.assigned_helper?.id === profile.id && 
            ride.status === "Assigned"
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
      await completeRide(rideId);
      setToastMessage("Ride completed successfully.");
      await loadData();
    } catch (err) {
      console.error("Error completing ride:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [rideId]: false }));
    }
  };

  const [certLoading, setCertLoading] = useState({});

  const handleViewCertificate = async (rideId) => {
    setCertLoading((prev) => ({ ...prev, [rideId]: true }));
    try {
      const data = await getRideCertificate(rideId);
      if (data && data.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error(err);
      setToastMessage(err.response?.data?.error || "Failed to view certificate.");
    } finally {
      setCertLoading((prev) => ({ ...prev, [rideId]: false }));
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
      
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          duration={4000} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      <div className="w-full max-w-[1480px] mx-auto px-5 md:px-8 lg:px-10 py-8 lg:py-12">
        <div className="flex gap-8">
          <HelperSidebar />

          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-cr-primary flex items-center gap-2">
                <Briefcase className="text-cr-secondary" />
                Assigned Rides
              </h1>
              <p className="text-cr-accent text-sm mt-1">
                View your active matches and complete rides to assist elderly riders.
              </p>
            </div>

            {rides.length === 0 ? (
              <div className="bg-cr-card rounded-[32px] shadow-xl p-8 md:p-10 border border-cr-border text-center">
                <p className="text-cr-accent font-medium">No rides assigned to you yet.</p>
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
                {rides.map((ride) => (
                  <motion.div
                    key={ride.id}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                    }}
                    className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] md:hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] p-6 md:p-10 border border-cr-border md:hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold text-cr-primary flex items-center gap-2">
                          <MapPin size={20} className="text-cr-secondary" />
                          {ride.pickup_location}
                          <span className="text-gray-400">→</span>
                          {ride.destination}
                        </h2>
                        <p className="text-cr-accent text-xs mt-1">Ride ID #{ride.id}</p>
                      </div>

                      <span
                        className={`px-4 py-1 rounded-full text-sm font-medium
                        ${
                          ride.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : ride.status === "Assigned"
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

                    {/* Rider Contact Info */}
                    {(ride.status === "Assigned" || ride.status === "Completed") && ride.rider_details && (
                      <div className="mt-6">
                        <p className="text-cr-accent text-xs mb-2">Rider Contact Details</p>
                        <div className="bg-cr-card border rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:gap-8 gap-2">
                          <div>
                            <p className="text-cr-accent text-xs">Name</p>
                            <p className="font-semibold text-cr-primary">{ride.rider_details.name}</p>
                          </div>
                          {ride.rider_details.phone_number && (
                            <div>
                              <p className="text-cr-accent text-xs">Phone Number</p>
                              <p className="font-medium text-cr-primary">{ride.rider_details.phone_number}</p>
                            </div>
                          )}
                          {ride.rider_details.email && (
                            <div>
                              <p className="text-cr-accent text-xs">Email</p>
                              <p className="font-medium text-cr-primary">{ride.rider_details.email}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Disability Certificate Block */}
                    {(ride.status === "Assigned" || ride.status === "Completed") && ride.rider_details && (
                      <div className="mt-6 border-t pt-4">
                        <p className="text-cr-accent text-xs mb-2">Disability Certificate</p>
                        <div className="bg-cr-card border rounded-lg p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <p className="text-sm text-cr-secondary">
                            Securely view the rider's official disability certificate.
                          </p>
                          <button
                            onClick={() => handleViewCertificate(ride.id)}
                            disabled={certLoading[ride.id]}
                            className="bg-cr-card border border-cr-border md:hover:border-cr-primary md:hover:text-cr-primary text-cr-text-primary w-full sm:w-auto px-6 py-3 min-h-[48px] rounded-xl font-semibold shadow-sm md:hover:shadow-md transition-all duration-300 text-sm flex items-center justify-center gap-2"
                          >
                            {certLoading[ride.id] ? (
                              <>
                              <Loader2 size={16} className="animate-spin" />
                                View Certificate
                              </>
                            ) : (
                              "View Certificate"
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {ride.additional_note && (
                      <div className="mt-6">
                        <p className="text-cr-accent text-xs mb-1">Additional Notes</p>
                        <div className="bg-cr-bg rounded-lg p-4 border text-sm text-cr-secondary">
                          {ride.additional_note}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 border-t pt-4">
                      {ride.status === "Assigned" && (
                        <button
                          onClick={() => handleCompleteRide(ride.id)}
                          disabled={actionLoading[ride.id]}
                          className="group bg-cr-primary md:hover:bg-cr-primary-hover text-white w-full sm:w-auto px-6 py-3 min-h-[48px] rounded-xl font-semibold shadow-sm md:shadow-[0_8px_20px_rgba(26,63,117,0.25)] md:hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          <CheckCircle size={18} />
                          {actionLoading[ride.id] ? "Completing..." : "Complete Ride"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
