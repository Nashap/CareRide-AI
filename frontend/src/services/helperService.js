import api from "./api";

/**
 * Get all helper profiles
 */
export const getHelpers = async () => {
  try {
    const response = await api.get("/helpers/");
    return response.data;
  } catch (error) {
    console.error("Error fetching helpers:", error);
    throw error;
  }
};

/**
 * Create a new helper profile
 */
export const createHelperProfile = async (helperData) => {
  try {
    const response = await api.post("/helpers/", helperData);
    return response.data;
  } catch (error) {
    console.error("Error creating helper profile:", error);
    throw error;
  }
};

/**
 * Update helper profile availability
 */
export const updateHelperProfile = async (helperId, helperData) => {
  try {
    const response = await api.patch(`/helpers/${helperId}/`, helperData);
    return response.data;
  } catch (error) {
    console.error("Error updating helper profile:", error);
    throw error;
  }
};
