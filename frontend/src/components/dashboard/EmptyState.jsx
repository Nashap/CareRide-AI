import { useNavigate } from "react-router-dom";

function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="bg-cr-card border border-cr-surface rounded-2xl min-h-[420px] flex flex-col items-center justify-center text-center px-6">

      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-cr-sage/20 flex items-center justify-center mb-5">
        <svg
          width="34"
          height="34"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 4 L22 16 L34 14 L24 22 L30 34 L20 26 L10 34 L16 22 L6 14 L18 16 Z"
            stroke="#0d9488"
            strokeWidth="1.5"
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-cr-primary mb-2">
        No rides yet
      </h2>

      {/* Description */}
      <p className="text-sm text-cr-accent mb-7 max-w-sm leading-relaxed">
        Book your first ride and CareRide AI will match you with the best helper
        based on your location and needs.
      </p>

      {/* Button */}
      <button
        onClick={() => navigate("/book-ride")}
        className="bg-cr-secondary hover:bg-cr-primary text-white text-sm font-medium px-6 py-2.5 rounded-lg transition"
      >
        Book a ride
      </button>

    </div>
  );
}

export default EmptyState;