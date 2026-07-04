import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Accessibility } from "lucide-react";

import { loginUser } from "../../services/authService";
import Toast from "../../components/common/Toast";
import PasswordInput from "../../components/common/PasswordInput";

function Login() {

  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");

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

      const data = await loginUser({
        ...formData,
        email: formData.email.trim().toLowerCase(),
      });

      if (data.role === "rider") {

        navigate("/dashboard/rider");

      }

      else if (data.role === "helper") {

        navigate("/dashboard/helper");

      }

      else {

        navigate("/");

      }

    }

    catch (err) {

      let errorMsg = "Unable to connect to the server. Please try again later.";
      
      if (err.response && err.response.data) {
        const data = err.response.data;
        errorMsg = "Invalid email or password.";
        if (data.error) errorMsg = data.error;
        else if (data.message) errorMsg = data.message;
        else if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          if (data[firstKey] && Array.isArray(data[firstKey])) {
            errorMsg = data[firstKey][0];
          } else if (typeof data.detail === 'string') {
            errorMsg = data.detail;
          }
        }
      }
      
      setError(errorMsg);

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white flex items-center justify-center px-4 py-10">
      
      {successMessage && <Toast message={successMessage} onClose={() => setSuccessMessage("")} />}

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

            Welcome Back

          </h2>

          <p className="text-gray-500 mt-2 mb-8">

            Sign in to continue using CareRide AI.

          </p>

          {error && (

            <div className="bg-red-100 text-red-700 rounded-xl p-3 mb-5">

              {error}

            </div>

          )}

          <form onSubmit={handleSubmit}>

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

              <PasswordInput
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-4 font-semibold transition"
            >

              {loading ? "Signing In..." : "Sign In"}

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

          {/* Register Link */}

          <p className="text-center text-gray-500 mt-8">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="text-teal-600 font-semibold hover:underline"
            >

              Create Account

            </Link>

          </p>

        </div>

      </div>

    </div>

  );

}

export default Login;