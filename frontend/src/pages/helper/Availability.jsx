import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import HelperNavbar from "../../components/dashboard/HelperNavbar";
import HelperSidebar from "../../components/dashboard/HelperSidebar";
import LoadingScreen from "../../components/common/LoadingScreen";

import { getHelpers, updateHelperProfile, createHelperProfile } from "../../services/helperService";
import { getCurrentUser } from "../../services/authService";
import { getProfile } from "../../services/profileService";

export default function Availability() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [helperProfile, setHelperProfile] = useState(null);
  const [available, setAvailable] = useState(true);
  const [success, setSuccess] = useState("");
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
    
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
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
      setAvailable(profile.availability);
    } catch (err) {
      console.error("Error loading availability:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvailability = async () => {
    if (!helperProfile) return;
    setSaving(true);
    setSuccess("");
    try {
      await updateHelperProfile(helperProfile.id, { availability: available });
      setSuccess("Availability updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating availability:", err);
    } finally {
      setSaving(false);
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
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-cr-primary flex items-center gap-2">
                <Clock className="text-cr-secondary" />
                Availability
              </h1>
              <p className="text-cr-accent text-sm mt-1">
                Toggle your status to control if you show up in new AI match recommendations.
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }} 
              className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] p-8 md:p-10 border border-cr-border max-w-xl transition-shadow"
            >
              {success && (
                <div className="mb-6 rounded-lg bg-green-100 border border-green-300 text-green-700 p-4 flex items-center gap-2 text-sm">
                  <CheckCircle size={18} />
                  {success}
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-xl bg-cr-bg mb-6">
                <div>
                  <h3 className="font-semibold text-cr-primary">Status</h3>
                  <p className="text-cr-accent text-xs mt-0.5">
                    {available
                      ? "You are active and ready to accept rides."
                      : "You will not receive new ride recommendation matches."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAvailable(!available)}
                  className={`w-14 h-8 rounded-full transition-colors relative flex items-center ${
                    available ? "bg-cr-secondary" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full bg-cr-card shadow absolute transition-transform ${
                      available ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleUpdateAvailability}
                  disabled={saving}
                  className="group bg-cr-primary hover:bg-cr-primary-hover text-white px-6 py-3 rounded-xl font-semibold shadow-[0_8px_20px_rgba(26,63,117,0.25)] hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Updating Availability...
                    </>
                  ) : (
                    "Update Availability"
                  )}
                </button>
              </div>
            </motion.div>
            
            </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
