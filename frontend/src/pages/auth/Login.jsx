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
    <div className="flex flex-col items-center justify-center h-full px-6 sm:px-12 md:px-14 w-full bg-white/80 md:bg-transparent">
      
      {/* Mobile Branding (Hidden on desktop overlay) */}
      <div className="flex justify-center items-center gap-2 mb-6 md:hidden">
        <div className="w-10 h-10 rounded-full bg-[#1A3F75] flex items-center justify-center shadow-md">
          <Accessibility size={20} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CareRide AI</h1>
      </div>
      
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">{title}</h2>
      <p className="text-gray-500 mb-8 text-center text-sm sm:text-base">{description}</p>
      
      {error && role === currentRole && (
        <div className="w-full max-w-sm bg-red-100 text-red-700 rounded-xl p-3 mb-5 text-sm whitespace-pre-line text-center">
          {error}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, currentRole)} className="w-full max-w-sm flex flex-col gap-4">
        <div className="relative w-full">
          <input
            type="email"
            id={`email-${currentRole}`}
            name="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={handleChange}
            className="peer w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 pt-6 pb-2 focus:outline-none focus:ring-2 focus:ring-[#1A3F75]/20 focus:border-[#1A3F75] transition-all placeholder-transparent"
            aria-label="Email Address"
          />
          <label
            htmlFor={`email-${currentRole}`}
            className="absolute left-4 top-2 text-xs font-medium text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#1A3F75] pointer-events-none"
          >
            Email Address
          </label>
        </div>
        
        <PasswordInput
          id={`password-${currentRole}`}
          name="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={handleChange}
          className="bg-gray-50 border-gray-200 text-gray-900"
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#1A3F75] md:hover:bg-[#00002A] active:bg-[#00001A] text-white rounded-xl py-3.5 font-bold transition-all shadow-md md:hover:shadow-lg transform md:hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A3F75] min-h-[44px]"
          aria-label={loading ? "Signing In" : "Sign In"}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="mt-6 mb-2 relative flex items-center justify-center w-full">
          <div className="border-t border-gray-200 w-full absolute left-0"></div>
          <span className="bg-white px-4 text-sm font-medium text-gray-400 relative z-10 tracking-widest">OR</span>
        </div>

        <button
          type="button"
          className="w-full bg-white border border-gray-200 rounded-xl py-3.5 flex items-center justify-center gap-3 md:hover:bg-gray-50 active:bg-gray-100 transition-all font-semibold text-gray-700 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-200 min-h-[44px]"
          aria-label="Continue with Google"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt=""
            aria-hidden="true"
            className="w-5 h-5"
          />
          Continue with Google
        </button>
      </form>
      
      <p className="text-center text-gray-500 mt-8 font-medium">
        Don't have an account?{" "}
        <Link to="/register" className="text-[#1A3F75] font-bold md:hover:text-[#00002A] md:hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A3F75] rounded-sm">
          Create Account
        </Link>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] flex items-center justify-center p-4 sm:p-6 md:p-8">
      
      {successMessage && <Toast message={successMessage} onClose={() => setSuccessMessage("")} />}

      {/* Mobile Toggle Layout (Visible only on small screens) */}
      <div className="w-full max-w-md md:hidden bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/40 overflow-hidden flex flex-col">
        <div className="grid grid-cols-2 bg-gray-100/80 p-1 m-6 mb-2 rounded-2xl">
          <button
            onClick={() => setRole("rider")}
            className={`py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3F75] min-h-[44px] ${
              role === "rider" ? "bg-white shadow-sm text-[#1A3F75]" : "text-gray-500 hover:text-gray-700"
            }`}
            aria-pressed={role === "rider"}
          >
            <Accessibility size={18} aria-hidden="true" />
            Rider
          </button>
          <button
            onClick={() => setRole("helper")}
            className={`py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3F75] min-h-[44px] ${
              role === "helper" ? "bg-white shadow-sm text-[#1A3F75]" : "text-gray-500 hover:text-gray-700"
            }`}
            aria-pressed={role === "helper"}
          >
            <HandHeart size={18} aria-hidden="true" />
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
      <div className="hidden md:flex relative w-full max-w-5xl h-[640px] bg-white/90 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_rgba(26,63,117,0.12)] border border-white/40 overflow-hidden">
        
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
                className="px-12 py-4 border-2 border-white rounded-full font-bold text-white hover:bg-[rgba(255,255,255,0.10)] transition-all transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 min-h-[44px]"
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
                className="px-12 py-4 border-2 border-white rounded-full font-bold text-white hover:bg-[rgba(255,255,255,0.10)] transition-all transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 min-h-[44px]"
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
