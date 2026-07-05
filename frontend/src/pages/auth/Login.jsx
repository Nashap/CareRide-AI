import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Accessibility, HandHeart, Car, HeartHandshake, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { loginUser } from "../../services/authService";
import Toast from "../../components/common/Toast";
import LoadingScreen from "../../components/common/LoadingScreen";
import PasswordInput from "../../components/common/PasswordInput";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("rider");

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

  const handleSubmit = async (e, currentRole) => {
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
      } else if (data.role === "helper") {
        navigate("/dashboard/helper");
      } else {
        navigate("/");
      }

    } catch (err) {
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
    } finally {
      setLoading(false);
    }
  };

  const renderForm = (currentRole, title, description) => (
    <div className="flex flex-col items-center justify-center h-full px-6 sm:px-12 md:px-14 w-full">
      
      {/* Mobile Branding (Hidden on desktop overlay) */}
      <div className="flex justify-center items-center gap-2 mb-6 md:hidden">
        <div className="w-10 h-10 rounded-full bg-[#1A3F75] flex items-center justify-center">
          <Accessibility size={20} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">CareRide AI</h1>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 mb-8 text-center">{description}</p>
      
      {error && role === currentRole && (
        <div className="w-full max-w-sm bg-red-100 text-red-700 rounded-xl p-3 mb-5 text-sm whitespace-pre-line text-center">
          {error}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, currentRole)} className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full bg-gray-50 border border-[#DDEAF5] rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[rgba(26,63,117,0.18)] focus:border-[#1A3F75] transition-all"
        />
        
        <PasswordInput
          name="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={handleChange}
          className="bg-gray-50 border-[#DDEAF5]"
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#00002A] hover:bg-[#1A3F75] active:bg-[#163764] text-white rounded-xl py-3.5 font-bold transition-all shadow-none transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="mt-6 mb-2 relative flex items-center justify-center w-full">
          <div className="border-t border-[#DDEAF5] w-full absolute left-0"></div>
          <span className="bg-white px-4 text-sm font-medium text-gray-400 relative z-10 tracking-widest">OR</span>
        </div>

        <button
          type="button"
          className="w-full border border-[#DDEAF5] rounded-xl py-3.5 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all font-semibold text-gray-600"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>
      </form>
      
      <p className="text-center text-gray-500 mt-8 font-medium">
        Don't have an account?{" "}
        <Link to="/register" className="text-[#1A3F75] font-bold hover:text-[#00002A] hover:underline">
          Create Account
        </Link>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
      
      {successMessage && <Toast message={successMessage} onClose={() => setSuccessMessage("")} />}

      {/* Mobile Toggle Layout (Visible only on small screens) */}
      <div className="w-full max-w-md md:hidden bg-white rounded-3xl shadow-[0_20px_60px_rgba(26,63,117,0.10)] overflow-hidden flex flex-col">
        <div className="grid grid-cols-2 bg-gray-100 p-1 m-6 mb-2 rounded-2xl">
          <button
            onClick={() => setRole("rider")}
            className={`py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              role === "rider" ? "bg-white shadow-sm text-[#1A3F75]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Accessibility size={18} />
            Rider
          </button>
          <button
            onClick={() => setRole("helper")}
            className={`py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              role === "helper" ? "bg-white shadow-sm text-[#1A3F75]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <HandHeart size={18} />
            Helper
          </button>
        </div>
        <div className="flex-1 py-4 pb-8">
          {role === "rider" 
            ? renderForm("rider", "Welcome Back", "Sign in to book a ride.")
            : renderForm("helper", "Welcome Back", "Sign in to start helping others.")}
        </div>
      </div>

      {/* Desktop Animated Sliding Layout */}
      <div className="hidden md:flex relative w-full max-w-5xl h-[640px] bg-white rounded-[32px] shadow-[0_20px_60px_rgba(26,63,117,0.10)] overflow-hidden">
        
        {/* Left Form: Rider */}
        <div className="absolute top-0 left-0 w-1/2 h-full z-10">
          <motion.div 
            initial={false}
            animate={{ opacity: role === "rider" ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            {renderForm("rider", "Welcome Back", "Sign in to book a ride.")}
          </motion.div>
        </div>

        {/* Right Form: Helper */}
        <div className="absolute top-0 right-0 w-1/2 h-full z-10">
          <motion.div 
            initial={false}
            animate={{ opacity: role === "helper" ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            {renderForm("helper", "Welcome Back", "Sign in to start helping others.")}
          </motion.div>
        </div>

        {/* Sliding Overlay Container */}
        <motion.div
          animate={{ x: role === "helper" ? "0%" : "100%" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 left-0 w-1/2 h-full z-50 overflow-hidden rounded-[32px] shadow-2xl"
        >
          {/* Inner Content sliding inversely to stay anchored */}
          <motion.div
            animate={{ x: role === "helper" ? "0%" : "-50%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-full w-[200%] bg-[linear-gradient(135deg,#00002A_0%,#1A3F75_55%,#5F82A8_100%)] text-white flex"
          >
            {/* Left Overlay Content (Shown when panel is on the Left, i.e., Helper is active) */}
            <div className="w-1/2 h-full flex flex-col items-center justify-center p-12 text-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_60%)] pointer-events-none" />
              
              <div className="w-20 h-20 rounded-full bg-[rgba(255,255,255,0.12)] backdrop-blur-md flex items-center justify-center mb-8 shadow-lg">
                <Car size={36} className="text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Need a ride?</h2>
              <p className="text-lg text-white/90 mb-12 max-w-[280px] leading-relaxed">
                Switch to a rider account to access rides and travel companions.
              </p>
              <button
                onClick={() => setRole("rider")}
                className="px-12 py-4 border-2 border-white rounded-full font-bold text-white hover:bg-[rgba(255,255,255,0.10)] transition-all transform hover:scale-105"
              >
                I'm a Rider
              </button>
            </div>

            {/* Right Overlay Content (Shown when panel is on the Right, i.e., Rider is active) */}
            <div className="w-1/2 h-full flex flex-col items-center justify-center p-12 text-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_60%)] pointer-events-none" />
              
              <div className="w-20 h-20 rounded-full bg-[rgba(255,255,255,0.12)] backdrop-blur-md flex items-center justify-center mb-8 shadow-lg">
                <HeartHandshake size={36} className="text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Want to help?</h2>
              <p className="text-lg text-white/90 mb-12 max-w-[300px] leading-relaxed">
                Switch to a helper account to manage your rides and assist people.
              </p>
              <button
                onClick={() => setRole("helper")}
                className="px-12 py-4 border-2 border-white rounded-full font-bold text-white hover:bg-[rgba(255,255,255,0.10)] transition-all transform hover:scale-105"
              >
                I'm a Helper
              </button>
            </div>

          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}

export default Login;