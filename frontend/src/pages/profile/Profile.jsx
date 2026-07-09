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
import FloatingInput from "../../components/common/FloatingInput";
import Button from "../../components/common/Button";

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
                    <FloatingInput
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />

                    <div>
                      <div className="relative w-full">
                        <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 pt-6 pb-2 text-gray-500 flex items-center gap-2 cursor-not-allowed min-h-[52px]">
                          <Mail size={16} />
                          {formData.email}
                        </div>
                        <label className="absolute left-4 top-2 text-xs font-medium text-gray-500 pointer-events-none">
                          Email Address (Read-only)
                        </label>
                      </div>
                    </div>

                    <FloatingInput
                      name="phone_number"
                      placeholder="Phone Number"
                      value={formData.phone_number}
                      onChange={handleChange}
                    />

                    <FloatingInput
                      type="date"
                      name="date_of_birth"
                      placeholder="Date of Birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                    />

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
                      <FloatingInput
                        name="address"
                        placeholder="Home Address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {!isHelper && (
                      <FloatingInput
                        name="disability_type"
                        placeholder="Disability / Mobility Support Type (e.g. Wheelchair)"
                        value={formData.disability_type}
                        onChange={handleChange}
                      />
                    )}
                    
                    {isHelper && (
                      <div className="md:col-span-2">
                        <FloatingInput
                          name="skills"
                          placeholder="Skills / Assistance Provided (e.g. CPR Certified)"
                          value={formData.skills}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {!isHelper && (
                    <div className="mt-6 md:mt-8 relative w-full">
                      <textarea
                        id="medical_notes"
                        name="medical_notes"
                        placeholder="Medical Notes / Special Instructions"
                        value={formData.medical_notes}
                        onChange={handleChange}
                        className="peer w-full min-h-[140px] bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 pt-6 pb-2 focus:outline-none focus:ring-2 focus:ring-[#1A3F75]/20 focus:border-[#1A3F75] transition-all placeholder-transparent resize-none"
                      />
                      <label
                        htmlFor="medical_notes"
                        className="absolute left-4 top-2 text-xs font-medium text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#1A3F75] pointer-events-none"
                      >
                        Medical Notes / Special Instructions
                      </label>
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
                      <FloatingInput
                        name="emergency_contact_name"
                        placeholder="Emergency Contact Name"
                        value={formData.emergency_contact_name}
                        onChange={handleChange}
                      />
                      <FloatingInput
                        name="emergency_contact_phone"
                        placeholder="Emergency Contact Phone"
                        value={formData.emergency_contact_phone}
                        onChange={handleChange}
                      />
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
                          <Button
                            type="button"
                            variant="outline"
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
                          >
                            View Certificate
                          </Button>
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
                        <Button
                          type="button"
                          variant="primary"
                          loading={uploadingCert}
                          onClick={handleUploadCert}
                          className="mt-4 w-fit"
                          aria-label={uploadingCert ? "Uploading" : "Upload Selected File"}
                        >
                          Upload Selected File
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end pt-4 w-full">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={saving}
                    className="w-full md:w-auto"
                  >
                    {!saving && <Save size={20} className="mr-2 group-hover:scale-110 transition-transform" />}
                    Save Changes
                  </Button>
                </div>
              </motion.form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
