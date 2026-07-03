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
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Toast from "../../components/common/Toast";

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

  // Dialog & Toast state
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, rideId: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const loadRides = async () => {
    try {
      // Fetch only rides belonging to the current user
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

  const openDeleteDialog = (id) => {
    setDeleteDialog({ isOpen: true, rideId: id });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, rideId: null });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.rideId) return;

    setIsDeleting(true);
    try {
      await deleteTravelRequest(deleteDialog.rideId);
      await loadRides();
      setToast({ message: "Ride deleted successfully.", type: "success" });
      closeDeleteDialog();
    } catch (err) {
      console.error(err);
      setToast({ 
        message: err.response?.data?.error || err.message || "Failed to delete ride.", 
        type: "error" 
      });
    } finally {
      setIsDeleting(false);
    }
  };
    return (

    <div className="min-h-screen bg-[#F5F0E8]">

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Ride"
        message={"Are you sure you want to delete this ride?\nThis action cannot be undone."}
        confirmText="Delete Ride"
        iconType="danger"
        isProcessing={isDeleting}
      />

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
                            : ride.status === "Waiting for another available helper"
                            ? "bg-gray-100 text-gray-700"
                            : ride.status === "Searching for another helper"
                            ? "bg-purple-100 text-purple-700"
                            : ride.status === "Waiting for Helper Response"
                            ? "bg-indigo-100 text-indigo-700"
                            : ride.status === "Assigned"
                            ? "bg-green-100 text-green-700"
                            : ride.status === "Completed"
                            ? "bg-blue-100 text-blue-700"
                            : ride.status === "Urgent AI Recommended"
                            ? "bg-red-500 text-white animate-pulse"
                            : ride.status === "Expired"
                            ? "bg-red-100 text-red-700 font-bold border border-red-200"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {ride.status === "Waiting for another available helper" 
                          ? "No helper accepted your request yet. CareRide AI is still searching." 
                          : ride.status}
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

                    {/* Helper Contact Info */}
                    {(ride.status === "Assigned" || ride.status === "Completed") && ride.assigned_helper && (
                      <div className="mt-6">
                        <p className="text-gray-500 text-sm mb-2">Assigned Helper Contact Details</p>
                        <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:gap-8 gap-2">
                          <div>
                            <p className="text-gray-500 text-xs">Name</p>
                            <p className="font-semibold text-gray-800">{ride.assigned_helper.name}</p>
                          </div>
                          {ride.assigned_helper.phone_number && (
                            <div>
                              <p className="text-gray-500 text-xs">Phone Number</p>
                              <p className="font-medium text-gray-800">{ride.assigned_helper.phone_number}</p>
                            </div>
                          )}
                          {ride.assigned_helper.email && (
                            <div>
                              <p className="text-gray-500 text-xs">Email</p>
                              <p className="font-medium text-gray-800">{ride.assigned_helper.email}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

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

                    {/* Dynamic AI Status Messages */}
                    {ride.status === "Searching for another helper" && (
                      <div className="mt-4 p-4 bg-purple-50 text-purple-800 rounded-lg text-sm border border-purple-100 font-medium">
                        The recommended helper declined your request. CareRide AI is finding another suitable helper.
                      </div>
                    )}
                    
                    {ride.status === "Waiting for another available helper" && (
                      <div className="mt-4 p-4 bg-gray-50 text-gray-800 rounded-lg text-sm border border-gray-200">
                        <p className="font-medium text-gray-900 mb-2">No AI helpers are currently available.</p>
                        <p className="text-gray-600 mb-4">All AI recommended helpers have declined, or no helpers matched your criteria. You can manually browse our helper directory or cancel the ride.</p>
                        <div className="flex gap-3">
                           <button 
                             onClick={() => navigate("/helpers")} 
                             className="bg-teal-600 hover:bg-teal-700 transition text-white px-5 py-2 rounded-lg font-medium shadow-sm"
                           >
                             Browse Helpers
                           </button>
                           <button 
                             onClick={() => openDeleteDialog(ride.id)} 
                             className="bg-white hover:bg-red-50 text-red-600 border border-red-200 px-5 py-2 rounded-lg font-medium transition"
                           >
                             Cancel Ride
                           </button>
                        </div>
                      </div>
                    )}

                    {/* Expired Ride Message */}
                    {ride.status === "Expired" && (
                      <div className="mt-6 flex justify-end">
                        <span className="text-gray-500 font-medium italic">This ride has expired.</span>
                      </div>
                    )}

                    {/* Delete Button (Hide if waiting for available helper to avoid duplicate buttons, or if Expired) */}
                    {ride.status !== "Waiting for another available helper" && ride.status !== "Expired" && (
                      <div className="flex justify-end mt-6">
                        <button
                          onClick={() => openDeleteDialog(ride.id)}
                          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2 rounded-lg transition font-medium"
                        >
                          <Trash2 size={18} />
                          Cancel Ride
                        </button>
                      </div>
                    )}

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