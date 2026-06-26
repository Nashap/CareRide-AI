import { useNavigate } from "react-router-dom";

function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-20 text-center bg-white">

      {/* Spark / star icon */}
      <div className="text-teal-500 mb-4">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4 L22 16 L34 14 L24 22 L30 34 L20 26 L10 34 L16 22 L6 14 L18 16 Z"
            stroke="#0d9488" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
          <circle cx="28" cy="10" r="2" fill="#0d9488"/>
        </svg>
      </div>

      <h2 className="text-gray-800 font-semibold text-base mb-2">
        No rides yet
      </h2>

      <p className="text-gray-500 text-sm mb-7 max-w-xs leading-relaxed">
        Book your first ride and we'll match you with a verified
        <br />helper using AI.
      </p>

      <button
        onClick={() => navigate("/book-ride")}
        className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-7 py-2.5 rounded-lg transition"
      >
        Book a ride
      </button>

    </div>
  );
}

export default EmptyState;
