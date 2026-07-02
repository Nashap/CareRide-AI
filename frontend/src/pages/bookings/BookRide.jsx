import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";

import { createTravelRequest } from "../../services/travelService";
import { getCurrentUser } from "../../services/authService";
import { recommendHelper } from "../../services/aiService";
import { getProfile } from "../../services/profileService";

export default function BookRide() {

  const navigate = useNavigate();

  const user = getCurrentUser();

  if (!user) {
    navigate("/login");
    return null;
  }

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [profileCompleted, setProfileCompleted] = useState(true);


  
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const profile = await getProfile(user.email);
        setProfileCompleted(profile.profile_completed);
      } catch (err) {
        console.error("Error checking profile status", err);
      }
    };
    if (user) checkProfile();
  }, [user]);

  const [formData, setFormData] = useState({
    rider: user.id,
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
            {/* Page Header */}

            <div className="mb-6">

              <h1 className="text-3xl font-bold text-gray-900">
                Book a Ride
              </h1>

              <p className="text-gray-500 text-sm mt-1">
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

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* ===================== */}
              {/* Trip Details Card */}
              {/* ===================== */}

              <div className="bg-white rounded-xl shadow p-8">

                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Trip Details
                </h2>

                <div className="grid md:grid-cols-2 gap-6">

                  <div>

                    <label className="block mb-2 font-medium">
                      Pickup Location
                    </label>

                    <input
                      type="text"
                      name="pickup_location"
                      value={formData.pickup_location}
                      onChange={handleChange}
                      placeholder="Enter pickup location"
                      className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />

                  </div>

                  <div>

                    <label className="block mb-2 font-medium">
                      Destination
                    </label>

                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="Enter destination"
                      className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />

                  </div>

                  <div>

                    <label className="block mb-2 font-medium">
                      Travel Date
                    </label>

                    <input
                      type="date"
                      name="travel_date"
                      value={formData.travel_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border rounded-lg p-3"
                      required
                    />

                  </div>
                  
                  <div>

                    <label className="block mb-2 font-medium">
                      Travel Time
                    </label>

                    <input
                      type="time"
                      name="travel_time"
                      value={formData.travel_time}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-3"
                      required
                    />

                  </div>

                  <div>

                    <label className="block mb-2 font-medium">
                      Service Type
                    </label>

                    <select
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-3"
                    >
                      <option value="Hospital visit">Hospital Visit</option>
                      <option value="Govt. office">Govt. Office</option>
                      <option value="Shopping">Shopping</option>
                      <option value="School / Work">School / Work</option>
                      <option value="Religious place">Religious Place</option>
                      <option value="Other">Other</option>
                    </select>

                  </div>

                </div>

              </div>
                            {/* ===================== */}
              {/* Assistance Details */}
              {/* ===================== */}

              <div className="bg-white rounded-xl shadow p-8">

                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Assistance Details
                </h2>

                <div className="grid md:grid-cols-2 gap-6">

                  <div>

                    <label className="block mb-2 font-medium">
                      Assistance Type
                    </label>

                    <select
                      name="assistance_type"
                      value={formData.assistance_type}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-3"
                      required
                    >
                      <option value="">Select Assistance</option>
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

                    </select>

                  </div>

                  <div>

                    <label className="block mb-2 font-medium">
                      Assistance Level
                    </label>

                    <select
                      name="assistance_level"
                      value={formData.assistance_level}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-3"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>

                  </div>

                </div>

                <div className="mt-6">

                  <label className="block mb-2 font-medium">
                    Additional Notes
                  </label>

                  <textarea
                    rows="4"
                    name="additional_note"
                    value={formData.additional_note}
                    onChange={handleChange}
                    placeholder="Enter additional information..."
                    className="w-full border rounded-lg p-3 resize-none"
                  />

                </div>

              </div>

              <div className="flex justify-end">

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  {loading ? "Booking..." : "Book Ride"}
                </button>

              </div>

            </form>
            </>
            )}

          </main>

        </div>

      </div>

    </div>
  );
}