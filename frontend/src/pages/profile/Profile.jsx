import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircle,
  Phone,
  Mail,
  ShieldAlert,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";
import HelperNavbar from "../../components/dashboard/HelperNavbar";
import HelperSidebar from "../../components/dashboard/HelperSidebar";

import { getProfile, updateProfile, uploadCertificate, getMyCertificate } from "../../services/profileService";
import { getCurrentUser } from "../../services/authService";
import LoadingScreen from "../../components/common/LoadingScreen";
import CustomSelect from "../../components/common/CustomSelect";

export default function Profile() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isHelper = user?.role === "helper";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [certificateData, setCertificateData] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [uploadingCert, setUploadingCert] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    disability_type: "",
    medical_notes: "",
    emergency_contact_phone: "",
    role: "",
    address: "",
    skills: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const profile = await getProfile(user.email);
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        disability_type: profile.disability_type || "",
        medical_notes: msgToEmpty(profile.medical_notes),
        emergency_contact_name: profile.emergency_contact_name || "",
        emergency_contact_phone: profile.emergency_contact_phone || "",
        role: profile.role || "",
        address: profile.address || "",
        skills: profile.skills || "",
      });
      if (!isHelper) {
        try {
          const cert = await getMyCertificate();
          if (cert.has_certificate) {
            setCertificateData(cert);
          }
        } catch (e) {
          console.error("Failed to fetch certificate", e);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch profile details from backend.");
    } finally {
      setLoading(false);
    }
  };

  const msgToEmpty = (val) => {
    return val === null || val === undefined ? "" : val;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (dob > today) {
        setError("Date of birth cannot be in the future.");
        setSaving(false);
        return;
      }
      if (dob.toDateString() === today.toDateString()) {
        setError("Date of birth cannot be today.");
        setSaving(false);
        return;
      }
      if (age < 18) {
        setError("You must be at least 18 years old.");
        setSaving(false);
        return;
      }
      if (age > 120) {
        setError("Invalid date of birth. Age exceeds 120 years.");
        setSaving(false);
        return;
      }
    }

    try {
      await updateProfile(user.email, formData);
      setSuccess("Profile updated successfully!");
      
      // Update local storage user name if it changed
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      localUser.name = formData.name;
      localStorage.setItem("user", JSON.stringify(localUser));

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Unable to update profile details.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        setCertFile(null);
        return;
      }
      setCertFile(file);
    }
  };

  const handleUploadCert = async () => {
    if (!certFile) return;
    setUploadingCert(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("file", certFile);
      const res = await uploadCertificate(formData);
      setSuccess("Certificate uploaded successfully!");
      setCertFile(null);
      // Refresh certificate data
      const cert = await getMyCertificate();
      if (cert.has_certificate) {
        setCertificateData(cert);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to upload certificate.");
    } finally {
      setUploadingCert(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cr-bg to-cr-surface">
      {isHelper ? <HelperNavbar /> : <RiderNavbar />}

      <div className="w-full max-w-[1480px] mx-auto px-5 md:px-8 lg:px-10 py-8 lg:py-12">
        <div className="flex gap-8">
          {isHelper ? <HelperSidebar /> : <RiderSidebar />}

          <main className="flex-1">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-cr-primary flex items-center gap-2">
                <UserCircle className="text-cr-secondary" />
                My Profile
              </h1>
              <p className="text-cr-accent text-sm mt-1">
                View and manage your personal details, emergency contacts, and mobility preferences.
              </p>
            </div>

            {success && (
              <div className="mb-5 rounded-lg bg-green-100 border border-green-300 text-green-700 p-4 flex items-center gap-2">
                <CheckCircle size={18} />
                {success}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-lg bg-red-100 border border-red-300 text-red-700 p-4 flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {loading ? (
              <div className="bg-cr-card rounded-[32px] shadow-xl p-12 text-center flex flex-col items-center justify-center border border-cr-border min-h-[400px]">
                <LoadingScreen />
              </div>
            ) : (
              <motion.form 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                onSubmit={handleSubmit} 
                className="space-y-10"
              >
                {/* Personal Information */}
                <div className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] md:hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] transition-shadow p-6 md:p-10 border border-cr-border">
                  <h2 className="text-xl font-bold text-cr-primary flex items-center gap-3">
                    <UserCircle size={24} className="text-cr-secondary" />
                    Personal Details
                  </h2>
                  <p className="text-sm text-cr-secondary mt-1 mb-5">
                    Update your personal information and address.
                  </p>
                  <hr className="border-cr-border mb-8" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <label className="block mb-2 font-medium text-sm text-cr-secondary">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full h-[52px] bg-cr-bg border border-cr-border rounded-[14px] px-4 text-sm text-cr-text-primary transition-all duration-300 focus:outline-none focus:border-cr-secondary focus:ring-4 focus:ring-[#A9C7E3]/20 placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-sm text-gray-400">Email Address (Read-only)</label>
                      <div className="w-full h-[52px] bg-cr-bg border border-cr-border rounded-[14px] px-4 text-sm text-gray-400 flex items-center gap-2">
                        <Mail size={18} />
                        {formData.email}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-sm text-cr-secondary">Phone Number</label>
                      <input
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        className="w-full h-[52px] bg-cr-bg border border-cr-border rounded-[14px] px-4 text-sm text-cr-text-primary transition-all duration-300 focus:outline-none focus:border-cr-secondary focus:ring-4 focus:ring-[#A9C7E3]/20 placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-sm text-cr-secondary">Date of Birth</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full h-[52px] bg-cr-bg border border-cr-border rounded-[14px] px-4 text-sm text-cr-text-primary transition-all duration-300 focus:outline-none focus:border-cr-secondary focus:ring-4 focus:ring-[#A9C7E3]/20"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-sm text-cr-secondary">Gender</label>
                      <CustomSelect
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        placeholder="Select Gender"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </CustomSelect>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block mb-2 font-medium text-sm text-cr-secondary">Home Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter full address"
                        required
                        className="w-full h-[52px] bg-cr-bg border border-cr-border rounded-[14px] px-4 text-sm text-cr-text-primary transition-all duration-300 focus:outline-none focus:border-cr-secondary focus:ring-4 focus:ring-[#A9C7E3]/20 placeholder:text-gray-400"
                      />
                    </div>

                    {!isHelper && (
                      <div>
                        <label className="block mb-2 font-medium text-sm text-cr-secondary">Disability / Mobility Support Type</label>
                        <input
                          type="text"
                          name="disability_type"
                          value={formData.disability_type}
                          onChange={handleChange}
                          placeholder="e.g. Wheelchair, Visually Impaired"
                          className="w-full h-[52px] bg-cr-bg border border-cr-border rounded-[14px] px-4 text-sm text-cr-text-primary transition-all duration-300 focus:outline-none focus:border-cr-secondary focus:ring-4 focus:ring-[#A9C7E3]/20 placeholder:text-gray-400"
                        />
                      </div>
                    )}
                    
                    {isHelper && (
                      <div className="md:col-span-2">
                        <label className="block mb-2 font-medium text-sm text-cr-secondary">Skills / Assistance Provided</label>
                        <input
                          type="text"
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          placeholder="e.g. CPR Certified, First Aid, Mobility and travel assistance"
                          required
                          className="w-full h-[52px] bg-cr-bg border border-cr-border rounded-[14px] px-4 text-sm text-cr-text-primary transition-all duration-300 focus:outline-none focus:border-cr-secondary focus:ring-4 focus:ring-[#A9C7E3]/20 placeholder:text-gray-400"
                        />
                      </div>
                    )}
                  </div>

                  {!isHelper && (
                    <div className="mt-6 md:mt-8">
                      <label className="block mb-2 font-medium text-sm text-cr-secondary">Medical Notes / Special Instructions</label>
                      <textarea
                        name="medical_notes"
                        value={formData.medical_notes}
                        onChange={handleChange}
                        placeholder="Add any specific health warnings or helpers instructions..."
                        className="w-full min-h-[140px] bg-cr-bg border border-cr-border rounded-[14px] p-4 text-sm text-cr-text-primary transition-all duration-300 focus:outline-none focus:border-cr-secondary focus:ring-4 focus:ring-[#A9C7E3]/20 placeholder:text-gray-400 resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                {!isHelper && (
                  <div className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] md:hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] transition-shadow p-6 md:p-10 border border-cr-border">
                    <h2 className="text-xl font-bold text-cr-primary flex items-center gap-3">
                      <ShieldAlert size={24} className="text-red-500" />
                      Emergency Contact
                    </h2>
                    <p className="text-sm text-cr-secondary mt-1 mb-5">
                      Who should we contact in an emergency?
                    </p>
                    <hr className="border-cr-border mb-8" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div>
                        <label className="block mb-2 font-medium text-sm text-cr-secondary">Contact Name</label>
                        <input
                          type="text"
                          name="emergency_contact_name"
                          value={formData.emergency_contact_name}
                          onChange={handleChange}
                          placeholder="Emergency contact full name"
                          className="w-full h-[52px] bg-cr-bg border border-cr-border rounded-[14px] px-4 text-sm text-cr-text-primary transition-all duration-300 focus:outline-none focus:border-cr-secondary focus:ring-4 focus:ring-[#A9C7E3]/20 placeholder:text-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 font-medium text-sm text-cr-secondary">Contact Phone Number</label>
                        <input
                          type="text"
                          name="emergency_contact_phone"
                          value={formData.emergency_contact_phone}
                          onChange={handleChange}
                          placeholder="Emergency contact phone number"
                          className="w-full h-[52px] bg-cr-bg border border-cr-border rounded-[14px] px-4 text-sm text-cr-text-primary transition-all duration-300 focus:outline-none focus:border-cr-secondary focus:ring-4 focus:ring-[#A9C7E3]/20 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Disability Certificate */}
                {!isHelper && (
                  <div className="bg-cr-card rounded-[24px] shadow-[0_8px_30px_rgba(26,63,117,0.08)] md:hover:shadow-[0_12px_40px_rgba(26,63,117,0.12)] transition-shadow p-6 md:p-10 border border-cr-border">
                    <h2 className="text-xl font-bold text-cr-primary flex items-center gap-3">
                      <ShieldAlert size={24} className="text-cr-secondary" />
                      Disability Certificate
                    </h2>
                    <p className="text-sm text-cr-secondary mt-1 mb-5">
                      Upload your official disability certificate to help helpers understand your needs better. This is securely stored and only visible to the helper assigned to your ride.
                    </p>
                    <hr className="border-cr-border mb-8" />
                    
                    {certificateData ? (
                      <div className="mb-8 p-6 bg-[#EEF5FF] rounded-[14px] border border-[#A9C7E3] flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-[#00002A] flex items-center gap-2">
                            <CheckCircle size={20} className="text-[#1A3F75]" />
                            Certificate Uploaded
                          </p>
                          <p className="text-[#5F82A8] text-sm mt-1">
                            Uploaded on: {new Date(certificateData.uploaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const freshCert = await getMyCertificate();
                                if (freshCert.has_certificate && freshCert.url) {
                                  window.open(freshCert.url, "_blank");
                                }
                              } catch (e) {
                                console.error("Failed to open certificate", e);
                                setError("Failed to open certificate.");
                              }
                            }}
                            className="bg-white border border-[#1A3F75] hover:bg-[#1A3F75] hover:text-white text-[#1A3F75] h-[48px] px-6 rounded-[14px] font-semibold shadow-sm hover:shadow-md transition-all duration-300 text-sm whitespace-nowrap"
                          >
                            View Certificate
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-8 p-5 bg-cr-bg rounded-[14px] border border-cr-border text-sm text-cr-accent flex items-center gap-3">
                        <AlertCircle size={18} />
                        No certificate uploaded yet.
                      </div>
                    )}

                    <div className="flex flex-col gap-4 max-w-xl p-6 bg-cr-bg rounded-[14px] border border-cr-border">
                      <label className="block font-semibold text-sm text-cr-primary">
                        {certificateData ? "Replace / Update Certificate" : "Upload New Certificate"}
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="text-sm text-cr-secondary file:cursor-pointer file:mr-4 file:py-3 file:px-6 file:rounded-[10px] file:border-0 file:text-sm file:font-semibold file:bg-cr-sage/20 file:text-cr-secondary hover:file:bg-cr-sage/40 transition-colors"
                      />
                      <p className="text-xs text-gray-500">Supported formats: PDF, JPG, PNG. Max size: 5 MB.</p>
                      
                      {certFile && (
                        <button
                          type="button"
                          onClick={handleUploadCert}
                          disabled={uploadingCert}
                          className="mt-4 bg-[#1A3F75] hover:bg-cr-primary text-white h-[52px] px-8 rounded-[14px] font-bold shadow-[0_4px_15px_rgba(26,63,117,0.15)] hover:shadow-[0_8px_20px_rgba(26,63,117,0.25)] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none w-fit"
                        >
                          {uploadingCert ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            "Upload Selected File"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end pt-4 w-full">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full md:w-auto group bg-cr-primary md:hover:bg-[#1A3F75] text-white px-10 h-[56px] rounded-[14px] font-bold shadow-sm md:shadow-[0_8px_20px_rgba(26,63,117,0.25)] md:hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all transform md:hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <Save size={20} className="group-hover:scale-110 transition-transform" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
