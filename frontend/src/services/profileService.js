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
