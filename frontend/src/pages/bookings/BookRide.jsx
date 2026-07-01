import { useState } from "react";
import { useNavigate } from "react-router-dom";

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";

import { createTravelRequest } from "../../services/travelService";
import { getCurrentUser } from "../../services/authService";

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

  const [formData, setFormData] = useState({
    rider: user.id,
    pickup_location: "",
    destination: "",
    travel_date: "",
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

    try {

      await createTravelRequest(formData);

      setSuccess("Ride booked successfully!");

      setTimeout(() => {
        navigate("/dashboard/rider");
      }, 1000);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Unable to create ride."
      );

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
                      <option value="Medical appointment">Medical Appointment</option>
                      <option value="Government office">Government Office</option>
                      <option value="Shopping">Shopping</option>
                      <option value="School / College">School / College</option>
                      <option value="Work">Work</option>
                      <option value="Religious place">Religious Place</option>
                      <option value="Family visit">Family Visit</option>
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
                      <option value="Wheelchair assistance">
                        Wheelchair Assistance
                        </option>
                        <option value="Walking assistance">
                          Walking Assistance
                          </option>
                          <option value="Walker support">
                            Walker Support
                            </option>
                            <option value="Crutches support">
                              Crutches Support
                              </option>

                              <option value="Travel companion">
                                Travel Companion
                              </option>

                              <option value="Visual guidance">
                                Visual Guidance
                              </option>

                              <option value="Hearing assistance">
                                Hearing Assistance
                              </option>

                              <option value="Luggage assistance">
                                Luggage Assistance
                              </option>

                              <option value="General mobility support">
                                General Mobility Support
                              </option>

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

          </main>

        </div>

      </div>

    </div>
  );
}