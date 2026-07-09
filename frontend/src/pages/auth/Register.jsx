import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Accessibility, HandHeart, Car, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";
import { registerUser } from "../../services/authService";
import PasswordInput from "../../components/common/PasswordInput";
import FloatingInput from "../../components/common/FloatingInput";
import Button from "../../components/common/Button";

function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("rider");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e, submittedRole) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await registerUser({
        name: formData.name,
        password: formData.password,
        email: formData.email.trim().toLowerCase(),
        role: submittedRole,
      });

      setSuccess("Account created successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error("Registration error:", err);
      let errorMsg = "Registration failed.";
      
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          errorMsg = data;
        } else if (data.error) {
          errorMsg = data.error;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (data.message) {
          errorMsg = data.message;
        } else if (typeof data === "object") {
          const errors = [];
          Object.entries(data).forEach(([field, messages]) => {
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
            if (Array.isArray(messages)) {
              errors.push(`${fieldName}: ${messages.join(" ")}`);
            } else if (typeof messages === "object") {
              errors.push(`${fieldName}: ${JSON.stringify(messages)}`);
            } else {
              errors.push(`${fieldName}: ${messages}`);
            }
          });
          if (errors.length > 0) {
            errorMsg = errors.join("\n");
          }
        }
      } else if (err.message === "Network Error") {
        errorMsg = "Unable to connect to the server. Please ensure the backend is running.";
      } else if (err.message) {
        errorMsg = err.message;
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
        <div className="w-full max-w-sm bg-red-100 text-red-700 rounded-xl p-3 mb-4 text-sm whitespace-pre-line text-center">
          {error}
        </div>
      )}
      
      {success && role === currentRole && (
        <div className="w-full max-w-sm bg-green-100 text-green-700 rounded-xl p-3 mb-4 text-sm text-center">
          {success}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, currentRole)} className="w-full max-w-sm flex flex-col gap-4">
        <FloatingInput
          type="text"
          id={`name-${currentRole}`}
          name="name"
          placeholder="Full Name"
          required
          value={formData.name}
          onChange={handleChange}
        />
        <FloatingInput
          type="email"
          id={`email-${currentRole}`}
          name="email"
          placeholder="Email Address"
          required
          value={formData.email}
          onChange={handleChange}
        />
        
        <PasswordInput
          id={`password-${currentRole}`}
          name="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={handleChange}
        />
        
        <PasswordInput
          id={`confirm-password-${currentRole}`}
          name="confirmPassword"
          placeholder="Confirm Password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        
        <Button
          type="submit"
          loading={loading}
          variant="primary"
          className="w-full mt-2"
          aria-label={loading ? "Creating Account" : "Create Account"}
        >
          Create Account
        </Button>

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
        Already have an account?{" "}
        <Link to="/login" className="text-[#1A3F75] font-bold md:hover:text-[#00002A] md:hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A3F75] rounded-sm">
          Sign in
        </Link>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] flex items-center justify-center p-4 sm:p-6 md:p-8">
      
      {/* Mobile Toggle Layout (Visible only on small screens) */}
      <div className="w-full max-w-sm md:hidden bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/40 overflow-hidden flex flex-col">
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
            ? renderForm("rider", "Rider Account", "Book accessible rides and trusted travel companions.")
            : renderForm("helper", "Helper Account", "Volunteer or work as a verified mobility helper.")}
        </div>
      </div>

      {/* Desktop Animated Sliding Layout */}
      <div className="hidden md:flex relative w-full max-w-4xl h-[680px] bg-white/90 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_rgba(26,63,117,0.12)] border border-white/40 overflow-hidden">
        
        {/* Left Form: Rider */}
        <div className="absolute top-0 left-0 w-1/2 h-full z-10">
          <motion.div 
            initial={false}
            animate={{ opacity: role === "rider" ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            {renderForm("rider", "Rider Account", "Book accessible rides and trusted travel companions.")}
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
            {renderForm("helper", "Helper Account", "Volunteer or work as a verified mobility helper.")}
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
                Switch to a rider account to book accessible rides and companions.
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
                Switch to a helper account to start assisting people in your community.
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

export default Register;
