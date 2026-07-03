import api from "./api";

/**
 * Get profile details by user email
 */
export const getProfile = async (email) => {
  try {
    const response = await api.get("/profile/", {
      params: { email },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Update profile details by email
 */
export const updateProfile = async (email, profileData) => {
  try {
    const response = await api.put("/profile/", profileData, {
      params: { email },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Upload Disability Certificate
 */
export const uploadCertificate = async (formData) => {
  try {
    const response = await api.post("/upload-certificate/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading certificate:", error);
    throw error;
  }
};

/**
 * Get My Certificate status/url
 */
export const getMyCertificate = async () => {
  try {
    const response = await api.get("/profile/certificate/");
    return response.data;
  } catch (error) {
    console.error("Error fetching certificate:", error);
    throw error;
  }
};

