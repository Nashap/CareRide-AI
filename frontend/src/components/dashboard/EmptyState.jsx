import { useNavigate } from "react-router-dom";

function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center py-24 text-center">

      {/* Spark icon */}
      <div className="text-teal-500 text-3xl mb-4 leading-none">✦</div>

      <h2 className="text-gray-800 font-semibold text-sm mb-1.5">
        No rides yet
      </h2>

      <p className="text-gray-500 text-sm mb-6 max-w-xs leading-relaxed">
        Book your first ride and we'll match you with a verified
        <br />
        helper using AI.
      </p>

      <button
        onClick={() => navigate("/book-ride")}
        className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition"
      >
        Book a ride
      </button>

    </div>
  );
}

export default EmptyState;
