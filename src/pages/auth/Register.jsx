import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Accessibility, HandHeart } from "lucide-react";
import { registerUser } from "../../services/authService";

function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState("rider");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await registerUser({
        ...formData,
        role,
      });

      setSuccess("Account created successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="flex justify-center items-center gap-2 mb-8">

          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">

            <Accessibility
              size={20}
              className="text-white"
            />

          </div>

          <h1 className="text-2xl font-bold text-slate-800">

            CareRide AI

          </h1>

        </div>

        {/* Card */}

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <h2 className="text-4xl font-bold text-slate-800">

            Create your account

          </h2>

          <p className="text-gray-500 mt-2 mb-8">

            Pick how you'll use CareRide AI.

          </p>

          {/* Role */}

          <div className="grid grid-cols-2 bg-gray-100 rounded-2xl p-1 mb-6">

            <button
              type="button"
              onClick={() => setRole("rider")}
              className={`rounded-xl py-3 font-semibold transition flex items-center justify-center gap-2 ${
                role === "rider"
                  ? "bg-white shadow text-teal-600"
                  : "text-gray-600"
              }`}
            >
              <Accessibility size={18} />

              I'm a Rider

            </button>

            <button
              type="button"
              onClick={() => setRole("helper")}
              className={`rounded-xl py-3 font-semibold transition flex items-center justify-center gap-2 ${
                role === "helper"
                  ? "bg-white shadow text-teal-600"
                  : "text-gray-600"
              }`}
            >
              <HandHeart size={18} />

              I'm a Helper

            </button>

          </div>

          <p className="text-gray-500 text-sm mb-6">

            {role === "rider"
              ? "Book accessible rides and trusted travel companions."
              : "Volunteer or work as a verified mobility helper."}

          </p>

          {error && (
            <div className="bg-red-100 text-red-700 rounded-xl p-3 mb-4">

              {error}

            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-700 rounded-xl p-3 mb-4">

              {success}

            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="mb-5">

              <label className="block text-sm font-medium mb-2">

                Full name

              </label>

              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />

            </div>

            <div className="mb-5">

              <label className="block text-sm font-medium mb-2">

                Email

              </label>

              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />

            </div>

            <div className="mb-6">

              <label className="block text-sm font-medium mb-2">

                Password

              </label>

              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-4 font-semibold transition"
            >
              {loading ? "Creating Account..." : "Create account"}
            </button>
                        {/* Divider */}

            <div className="flex items-center my-8">

              <div className="flex-1 border-t border-gray-200"></div>

              <span className="px-4 text-gray-400 text-sm">

                OR CONTINUE WITH

              </span>

              <div className="flex-1 border-t border-gray-200"></div>

            </div>

            {/* Google Button (UI Only) */}

            <button
              type="button"
              className="w-full border border-gray-300 rounded-xl py-3 flex items-center justify-center gap-3 hover:bg-gray-50 transition"
            >

              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />

              <span className="font-medium text-gray-700">

                Continue with Google

              </span>

            </button>

          </form>

          {/* Login */}

          <p className="text-center text-gray-500 mt-8">

            Already have an account?{" "}

            <Link
              to="/login"
              className="text-teal-600 font-semibold hover:underline"
            >

              Sign in

            </Link>

          </p>

        </div>

      </div>

    </div>

  );
}

export default Register;