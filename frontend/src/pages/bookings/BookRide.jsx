import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";
import { motion } from "framer-motion";
import CustomSelect from "../../components/common/CustomSelect";

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
                <button
                  onClick={() => navigate("/profile")}
                  className="group bg-cr-primary hover:bg-cr-primary-hover text-white px-8 py-4 rounded-xl font-semibold shadow-[0_8px_20px_rgba(26,63,117,0.25)] hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all duration-300 inline-block"
                >
                  Complete Profile
                </button>
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

              <div className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] transition-shadow p-8 md:p-10 border border-cr-border">

                <h2 className="text-xl font-bold text-cr-primary mb-8">
                  Trip Details
                </h2>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">

                  <div>
                    <label className="block mb-2 font-medium text-sm text-cr-secondary">
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      name="pickup_location"
                      value={formData.pickup_location}
                      onChange={handleChange}
                      placeholder="Enter pickup location"
                      className="w-full h-[52px] bg-cr-bg border border-cr-border rounded-[14px] px-4 text-sm text-cr-text-primary transition-all duration-300 focus:outline-none focus:border-cr-secondary focus:ring-4 focus:ring-[#A9C7E3]/20 placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-sm text-cr-secondary">
                      Destination
                    </label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="Enter destination"
                      className="w-full h-[52px] bg-cr-bg border border-cr-border rounded-[14px] px-4 text-sm text-cr-text-primary transition-all duration-300 focus:outline-none focus:border-cr-secondary focus:ring-4 focus:ring-[#A9C7E3]/20 placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-sm text-cr-secondary">
                      Travel Date
                    </label>
                    <input
                      type="date"
                      name="travel_date"
                      value={formData.travel_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-[52px] bg-cr-bg border border-cr-border rounded-[14px] px-4 text-sm text-cr-text-primary transition-all duration-300 focus:outline-none focus:border-cr-secondary focus:ring-4 focus:ring-[#A9C7E3]/20 placeholder:text-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-sm text-cr-secondary">
                      Travel Time
                    </label>
                    <input
                      type="time"
                      name="travel_time"
                      value={formData.travel_time}
                      onChange={handleChange}
                      className="w-full h-[52px] bg-cr-bg border border-cr-border rounded-[14px] px-4 text-sm text-cr-text-primary transition-all duration-300 focus:outline-none focus:border-cr-secondary focus:ring-4 focus:ring-[#A9C7E3]/20 placeholder:text-gray-400"
                      required
                    />
                  </div>

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

              <div className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] transition-shadow p-8 md:p-10 border border-cr-border">

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

                <div className="mt-6 md:mt-8">
                  <label className="block mb-2 font-medium text-sm text-cr-secondary">
                    Additional Notes
                  </label>
                  <textarea
                    name="additional_note"
                    value={formData.additional_note}
                    onChange={handleChange}
                    placeholder="Enter additional information..."
                    className="w-full min-h-[140px] bg-cr-bg border border-cr-border rounded-[14px] p-4 text-sm text-cr-text-primary transition-all duration-300 focus:outline-none focus:border-cr-secondary focus:ring-4 focus:ring-[#A9C7E3]/20 placeholder:text-gray-400 resize-none"
                  />
                </div>

              </div>

              <div className="flex justify-end">

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cr-primary hover:bg-cr-primary-hover text-white py-4 rounded-xl font-bold shadow-[0_8px_20px_rgba(26,63,117,0.25)] hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Booking Ride...
                    </>
                  ) : (
                    "Book Ride"
                  )}
                </button>

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