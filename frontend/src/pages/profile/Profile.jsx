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

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";
import HelperNavbar from "../../components/dashboard/HelperNavbar";
import HelperSidebar from "../../components/dashboard/HelperSidebar";

import { getProfile, updateProfile, uploadCertificate, getMyCertificate } from "../../services/profileService";
import { getCurrentUser } from "../../services/authService";

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
    <div className="min-h-screen bg-[#F5F0E8]">
      {isHelper ? <HelperNavbar /> : <RiderNavbar />}

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-8">
          {isHelper ? <HelperSidebar /> : <RiderSidebar />}

          <main className="flex-1">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <UserCircle className="text-teal-600" />
                My Profile
              </h1>
              <p className="text-gray-500 text-sm mt-1">
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
              <div className="bg-white rounded-xl shadow p-12 text-center flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-teal-600 mb-2" />
                <p className="text-gray-500">Loading your profile details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow p-8 border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <UserCircle size={20} className="text-teal-600" />
                    Personal Details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium text-sm text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-sm text-gray-400">Email Address (Read-only)</label>
                      <div className="w-full border rounded-lg p-3 bg-gray-50 text-gray-400 text-sm flex items-center gap-2">
                        <Mail size={16} />
                        {formData.email}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-sm text-gray-700">Phone Number</label>
                      <input
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-sm text-gray-700">Date of Birth</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-sm text-gray-700">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-3 text-sm"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block mb-2 font-medium text-sm text-gray-700">Home Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter full address"
                        required
                        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>

                    {!isHelper && (
                      <div>
                        <label className="block mb-2 font-medium text-sm text-gray-700">Disability / Mobility Support Type</label>
                        <input
                          type="text"
                          name="disability_type"
                          value={formData.disability_type}
                          onChange={handleChange}
                          placeholder="e.g. Wheelchair, Visually Impaired"
                          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                      </div>
                    )}
                    
                    {isHelper && (
                      <div className="md:col-span-2">
                        <label className="block mb-2 font-medium text-sm text-gray-700">Skills / Assistance Provided</label>
                        <input
                          type="text"
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          placeholder="e.g. CPR Certified, First Aid, Mobility and travel assistance"
                          required
                          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {!isHelper && (
                    <div className="mt-6">
                      <label className="block mb-2 font-medium text-sm text-gray-700">Medical Notes / Special Instructions</label>
                      <textarea
                        rows="4"
                        name="medical_notes"
                        value={formData.medical_notes}
                        onChange={handleChange}
                        placeholder="Add any specific health warnings or helpers instructions..."
                        className="w-full border rounded-lg p-3 text-sm resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                {!isHelper && (
                  <div className="bg-white rounded-xl shadow p-8 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                      <ShieldAlert size={20} className="text-red-500" />
                      Emergency Contact
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-2 font-medium text-sm text-gray-700">Contact Name</label>
                        <input
                          type="text"
                          name="emergency_contact_name"
                          value={formData.emergency_contact_name}
                          onChange={handleChange}
                          placeholder="Emergency contact full name"
                          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 font-medium text-sm text-gray-700">Contact Phone Number</label>
                        <input
                          type="text"
                          name="emergency_contact_phone"
                          value={formData.emergency_contact_phone}
                          onChange={handleChange}
                          placeholder="Emergency contact phone number"
                          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Disability Certificate */}
                {!isHelper && (
                  <div className="bg-white rounded-xl shadow p-8 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                      <ShieldAlert size={20} className="text-teal-600" />
                      Disability Certificate
                    </h2>
                    <div className="mb-4 text-sm text-gray-600">
                      Upload your official disability certificate to help helpers understand your needs better. 
                      This is securely stored and only visible to the helper assigned to your ride.
                    </div>
                    
                    {certificateData ? (
                      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-green-800 flex items-center gap-2">
                            <CheckCircle size={18} />
                            Certificate Uploaded
                          </p>
                          <p className="text-green-600 text-sm mt-1">
                            Uploaded on: {new Date(certificateData.uploaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
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
                            className="text-teal-600 hover:text-teal-700 font-medium text-sm underline focus:outline-none"
                          >
                            View Certificate
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg border text-sm text-gray-500">
                        No certificate uploaded.
                      </div>
                    )}

                    <div className="flex flex-col gap-3 max-w-md">
                      <label className="block font-medium text-sm text-gray-700">
                        {certificateData ? "Replace / Update Certificate" : "Upload Certificate"}
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                      />
                      <p className="text-xs text-gray-400">Supported formats: PDF, JPG, PNG. Max size: 5 MB.</p>
                      
                      {certFile && (
                        <button
                          type="button"
                          onClick={handleUploadCert}
                          disabled={uploadingCert}
                          className="mt-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium transition disabled:bg-gray-400 self-start text-sm flex items-center gap-2"
                        >
                          {uploadingCert ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
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
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
