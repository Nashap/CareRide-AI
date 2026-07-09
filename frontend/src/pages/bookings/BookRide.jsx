import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";
import { motion } from "framer-motion";
import CustomSelect from "../../components/common/CustomSelect";
import FloatingInput from "../../components/common/FloatingInput";
import Button from "../../components/common/Button";

import { createTravelRequest } from "../../services/travelService";
import { getCurrentUser } from "../../services/authService";
import { recommendHelper } from "../../services/aiService";
import { getProfile } from "../../services/profileService";

export default function BookRide() {

  const navigate = useNavigate();
  const user = getCurrentUser();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
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
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    rider: user?.id || "",
    pickup_location: "",
    destination: "",
    travel_date: "",
    travel_time: "",
    service_type: "Hospital visit",
    assistance_type: "",
    assistance_level: "Medium",
    additional_note: "",
    status: "Pending",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    const today = new Date().toISOString().split("T")[0];
    if (formData.travel_date < today) {
      setError("You cannot book a ride in the past.");
      setLoading(false);
      return;
    }
    
    if (formData.travel_date === today && formData.travel_time) {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, "0");
      const currentMinutes = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${currentHours}:${currentMinutes}`;
      
      if (formData.travel_time < currentTime) {
        setError("Travel time cannot be in the past for today's date.");
        setLoading(false);
        return;
      }
    }

    let response;

    try {
      response = await createTravelRequest(formData);
      setSuccess("AI is finding the best helper.");
    } catch (err) {
      console.error(err);
      
      let errorMessage = "Failed to create ride request.";
      if (err.response?.data) {
        if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (typeof err.response.data === "object") {
          // Handle DRF serializer validation errors (e.g. { pickup_location: ["too short"] })
          const errors = [];
          Object.keys(err.response.data).forEach(key => {
            const fieldError = err.response.data[key];
            if (Array.isArray(fieldError)) {
              errors.push(`${key}: ${fieldError[0]}`);
            } else {
              errors.push(`${key}: ${fieldError}`);
            }
          });
          if (errors.length > 0) errorMessage = errors.join(" | ");
        }
      }
      
      setError(errorMessage);
      setLoading(false);
      return;
    }

    try {
      // Call AI Recommendation API
      await recommendHelper(response.id);

      setSuccess("AI Recommendations generated successfully!");

      setTimeout(() => {
        navigate(`/ai-recommendation/${response.id}`);
      }, 1000);

    } catch (err) {
      console.error(err);
      
      const aiError = err.response?.data?.detail || err.response?.data?.error || "AI recommendation unavailable.";
      setError(`Ride Created Successfully, but ${aiError}`);
      
      setTimeout(() => {
        navigate("/my-rides");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

    return (
    <div className="min-h-screen bg-gradient-to-b from-cr-bg to-cr-surface">

      <RiderNavbar />

      <div className="w-full max-w-[1480px] mx-auto px-5 md:px-8 lg:px-10 py-8 lg:py-12">

        <div className="flex gap-8">

          <RiderSidebar />

          <main className="flex-1">
          
            {!profileCompleted ? (
              <div className="bg-cr-card rounded-[32px] shadow-xl p-12 text-center border border-cr-border max-w-2xl mx-auto mt-10">
                <h2 className="text-2xl font-bold text-cr-primary mb-4">Profile Incomplete</h2>
                <p className="text-cr-accent mb-8">
                  Please complete your profile before booking your first ride.
                </p>
                <Button
                  onClick={() => navigate("/profile")}
                  variant="primary"
                  className="px-8 mt-4"
                >
                  Complete Profile
                </Button>
              </div>
            ) : (
              <>
            {/* Page Header */}

            <div className="mb-6">

              <h1 className="text-3xl font-bold text-cr-primary">
                Book a Ride
              </h1>

              <p className="text-cr-accent text-sm mt-1">
                Fill in your travel details to request a CareRide helper.
              </p>

            </div>

            {success && (
              <div className="mb-5 rounded-lg bg-green-100 border border-green-300 text-green-700 p-4">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-lg bg-red-100 border border-red-300 text-red-700 p-4">
                {error}
              </div>
            )}

            <motion.form
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-10"
            >

              {/* ===================== */}
              {/* Trip Details Card */}
              {/* ===================== */}

              <div className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] md:hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] transition-shadow p-6 md:p-10 border border-cr-border">

                <h2 className="text-xl font-bold text-cr-primary mb-8">
                  Trip Details
                </h2>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">

                  <FloatingInput
                    name="pickup_location"
                    placeholder="Pickup Location"
                    value={formData.pickup_location}
                    onChange={handleChange}
                    required
                  />

                  <FloatingInput
                    name="destination"
                    placeholder="Destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                  />

                  <FloatingInput
                    type="date"
                    name="travel_date"
                    placeholder="Travel Date"
                    value={formData.travel_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                  
                  <FloatingInput
                    type="time"
                    name="travel_time"
                    placeholder="Travel Time"
                    value={formData.travel_time}
                    onChange={handleChange}
                    required
                  />

                  <div>
                    <label className="block mb-2 font-medium text-sm text-cr-secondary">
                      Service Type
                    </label>
                    <CustomSelect
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleChange}
                      placeholder="Select Service"
                    >
                      <option value="Hospital visit">Hospital Visit</option>
                      <option value="Govt. office">Govt. Office</option>
                      <option value="Shopping">Shopping</option>
                      <option value="School / Work">School / Work</option>
                      <option value="Religious place">Religious Place</option>
                      <option value="Other">Other</option>
                    </CustomSelect>
                  </div>

                </div>

              </div>
              
              {/* ===================== */}
              {/* Assistance Details */}
              {/* ===================== */}

              <div className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] md:hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] transition-shadow p-6 md:p-10 border border-cr-border">

                <h2 className="text-xl font-bold text-cr-primary mb-8">
                  Assistance Details
                </h2>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">

                  <div>
                    <label className="block mb-2 font-medium text-sm text-cr-secondary">
                      Assistance Type
                    </label>
                    <CustomSelect
                      name="assistance_type"
                      value={formData.assistance_type}
                      onChange={handleChange}
                      placeholder="Select Assistance"
                    >
                      <option value="Wheelchair assistance">Wheelchair assistance</option>
                      <option value="Walker support">Walker support</option>
                      <option value="Crutches support">Crutches support</option>
                      <option value="Walking assistance">Walking assistance</option>
                      <option value="Travel companion">Travel companion</option>
                      <option value="Hospital visit">Hospital visit</option>
                      <option value="Shopping help">Shopping help</option>
                      <option value="Govt. office help">Govt. office help</option>
                      <option value="Elderly care">Elderly care</option>
                      <option value="Visually impaired">Visually impaired</option>
                      <option value="Hearing impaired">Hearing impaired</option>
                      <option value="Post-surgery">Post-surgery</option>
                    </CustomSelect>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-sm text-cr-secondary">
                      Assistance Level
                    </label>
                    <CustomSelect
                      name="assistance_level"
                      value={formData.assistance_level}
                      onChange={handleChange}
                      placeholder="Select Level"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </CustomSelect>
                  </div>

                </div>

                <div className="mt-6 md:mt-8 relative w-full">
                  <textarea
                    id="additional_note"
                    name="additional_note"
                    placeholder="Additional Notes"
                    value={formData.additional_note}
                    onChange={handleChange}
                    className="peer w-full min-h-[140px] bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 pt-6 pb-2 focus:outline-none focus:ring-2 focus:ring-[#1A3F75]/20 focus:border-[#1A3F75] transition-all placeholder-transparent resize-none"
                  />
                  <label
                    htmlFor="additional_note"
                    className="absolute left-4 top-2 text-xs font-medium text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#1A3F75] pointer-events-none"
                  >
                    Additional Notes
                  </label>
                </div>

              </div>

              <div className="flex justify-end">

                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full mt-4"
                >
                  Book Ride
                </Button>

              </div>

            </motion.form>
            </>
            )}

          </main>

        </div>

      </div>

    </div>
  );
}
