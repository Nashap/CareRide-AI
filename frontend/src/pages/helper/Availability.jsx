import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle } from "lucide-react";

import HelperNavbar from "../../components/dashboard/HelperNavbar";
import HelperSidebar from "../../components/dashboard/HelperSidebar";

import { getHelpers, updateHelperProfile, createHelperProfile } from "../../services/helperService";
import { getCurrentUser } from "../../services/authService";

export default function Availability() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [helperProfile, setHelperProfile] = useState(null);
  const [available, setAvailable] = useState(true);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
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
      <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
        <HelperNavbar />
        <div className="max-w-7xl mx-auto px-6 py-6 flex-1 flex items-center justify-center">
          <p className="text-gray-500 font-medium">Loading availability...</p>
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
                <Clock className="text-teal-600" />
                Availability
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Toggle your status to control if you show up in new AI match recommendations.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-8 max-w-xl">
              {success && (
                <div className="mb-6 rounded-lg bg-green-100 border border-green-300 text-green-700 p-4 flex items-center gap-2 text-sm">
                  <CheckCircle size={18} />
                  {success}
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800">Status</h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {available
                      ? "You are active and ready to accept rides."
                      : "You will not receive new ride recommendation matches."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAvailable(!available)}
                  className={`w-14 h-8 rounded-full transition-colors relative flex items-center ${
                    available ? "bg-teal-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full bg-white shadow absolute transition-transform ${
                      available ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleUpdateAvailability}
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-lg transition disabled:bg-gray-300"
                >
                  {saving ? "Updating..." : "Update Availability"}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
