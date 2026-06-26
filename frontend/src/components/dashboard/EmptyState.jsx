import { Car, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">

      {/* Icon */}
      <div className="w-24 h-24 mx-auto rounded-full bg-teal-100 flex items-center justify-center mb-6">
        <Car className="text-teal-600" size={42} />
      </div>

      {/* Heading */}
      <h2 className="text-3xl font-bold text-gray-800 mb-3">
        No Rides Yet
      </h2>

      {/* Description */}
      <p className="text-gray-500 max-w-md mx-auto leading-7 mb-8">
        You haven't booked any rides yet.
        Start your first journey and CareRide AI will
        connect you with the most suitable helper nearby.
      </p>

      {/* Button */}
      <button
        onClick={() => navigate("/book-ride")}
        className="
          inline-flex
          items-center
          gap-2
          bg-teal-500
          hover:bg-teal-600
          text-white
          px-8
          py-4
          rounded-xl
          font-semibold
          transition
        "
      >
        <Plus size={20} />
        Book Your First Ride
      </button>

    </div>
  );
}

export default EmptyState;