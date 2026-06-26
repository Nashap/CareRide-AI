import { Car } from "lucide-react";
import { useNavigate } from "react-router-dom";

function EmptyRide() {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-dashed border-gray-300 rounded-2xl h-[420px] flex items-center justify-center">

      <div className="text-center">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
          <Car size={28} className="text-teal-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          No rides yet
        </h2>

        {/* Description */}
        <p className="text-gray-500 max-w-md mx-auto leading-7 mb-8">
          Book your first ride and CareRide AI will
          match you with a verified helper based on
          your location, mobility needs, and ratings.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/book-ride")}
          className="
            bg-teal-600
            hover:bg-teal-700
            text-white
            px-8
            py-3
            rounded-lg
            font-medium
            transition
          "
        >
          Book a Ride
        </button>

      </div>

    </div>
  );
}

export default EmptyRide;