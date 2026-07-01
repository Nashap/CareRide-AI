import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Calendar,
  MapPin,
  Activity,
  Trash2,
  Plus,
} from "lucide-react";

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";
import EmptyState from "../../components/dashboard/EmptyState";

import {
  getTravelRequests,
  deleteTravelRequest,
} from "../../services/travelService";

import { getCurrentUser } from "../../services/authService";

export default function MyRides() {

  const navigate = useNavigate();

  const user = getCurrentUser();

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRides = async () => {

    try {

      const response = await getTravelRequests();

      const allRides = response.results || response;

      const myRides = allRides.filter(
        (ride) => ride.rider === user.id
      );

      setRides(myRides);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadRides();

  }, []);

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this ride?"))
      return;

    try {

      await deleteTravelRequest(id);

      loadRides();

    } catch (err) {

      console.error(err);

    }

  };
    return (

    <div className="min-h-screen bg-[#F5F0E8]">

      <RiderNavbar />

      <div className="max-w-7xl mx-auto px-6 py-6">

        <div className="flex gap-8">

          <RiderSidebar />

          <main className="flex-1">

            {/* Header */}

            <div className="flex items-center justify-between mb-6">

              <div>

                <h1 className="text-3xl font-bold text-gray-900">
                  My Rides
                </h1>

                <p className="text-gray-500 text-sm mt-1">
                  Track and manage all your CareRide bookings.
                </p>

              </div>

              <button
                onClick={() => navigate("/book-ride")}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-lg font-medium transition"
              >

                <Plus size={18} />

                Book a New Ride

              </button>

            </div>

            {loading ? (

              <div className="bg-white rounded-xl shadow p-8 text-center">

                <p className="text-gray-500">
                  Loading your rides...
                </p>

              </div>

            ) : rides.length === 0 ? (

              <EmptyState />

            ) : (

              <div className="space-y-6">
                {rides.map((ride) => (

                  <div
                    key={ride.id}
                    className="bg-white rounded-xl shadow border border-gray-200 p-6 hover:shadow-lg transition"
                  >

                    {/* Ride Header */}

                    <div className="flex justify-between items-start">

                      <div>

                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">

                          <MapPin
                            size={20}
                            className="text-teal-600"
                          />

                          {ride.pickup_location}

                          <span className="text-gray-400">
                            →
                          </span>

                          {ride.destination}

                        </h2>

                        <p className="text-gray-500 text-sm mt-1">
                          Ride ID #{ride.id}
                        </p>

                      </div>

                      <span
                        className={`px-4 py-1 rounded-full text-sm font-medium
                        ${
                          ride.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : ride.status === "Accepted"
                            ? "bg-green-100 text-green-700"
                            : ride.status === "Completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {ride.status}
                      </span>

                    </div>

                    {/* Ride Details */}

                    <div className="grid md:grid-cols-2 gap-6 mt-6">

                      <div>

                        <div className="flex items-center gap-2 mb-1">

                          <Calendar
                            size={18}
                            className="text-teal-600"
                          />

                          <p className="text-gray-500 text-sm">
                            Travel Date
                          </p>

                        </div>

                        <p className="font-semibold">
                          {ride.travel_date}
                        </p>

                      </div>

                      <div>

                        <div className="flex items-center gap-2 mb-1">

                          <Activity
                            size={18}
                            className="text-teal-600"
                          />

                          <p className="text-gray-500 text-sm">
                            Service Type
                          </p>

                        </div>

                        <p className="font-semibold">
                          {ride.service_type}
                        </p>

                      </div>

                      <div>

                        <p className="text-gray-500 text-sm mb-1">
                          Assistance Type
                        </p>

                        <p className="font-semibold">
                          {ride.assistance_type}
                        </p>

                      </div>

                      <div>

                        <p className="text-gray-500 text-sm mb-1">
                          Assistance Level
                        </p>

                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm
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

                    {/* Additional Notes */}

                    {ride.additional_note && (

                      <div className="mt-6">

                        <p className="text-gray-500 text-sm mb-2">
                          Additional Notes
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 border">

                          {ride.additional_note}

                        </div>

                      </div>

                    )}

                    {/* Delete Button */}

                    <div className="flex justify-end mt-6">

                      <button
                        onClick={() =>
                          handleDelete(ride.id)
                        }
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition"
                      >

                        <Trash2 size={18} />

                        Delete Ride

                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </main>

        </div>

      </div>

    </div>

  );

}