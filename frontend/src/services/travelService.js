import api from "./api";

/**
 * Get all travel requests
 */
export const getTravelRequests = async () => {
  try {
    const response = await api.get("/travel-requests/");

    return response.data;

  } catch (error) {
    console.error(
      "Error fetching travel requests:",
      error
    );

    throw error;
  }
};

/**
 * Get travel request by ID
 */
export const getTravelRequest = async (id) => {
  try {
    const response = await api.get(
      `/travel-requests/${id}/`
    );

    return response.data;

  } catch (error) {
    console.error(
      "Error fetching travel request:",
      error
    );

    throw error;
  }
};

/**
 * Create travel request
 */
export const createTravelRequest = async (travelData) => {
  try {
    const response = await api.post(
      "/travel-requests/",
      travelData
    );

    return response.data;

  } catch (error) {
    console.error(
      "Error creating travel request:",
      error
    );

    throw error;
  }
};

/**
 * Update travel request
 */
export const updateTravelRequest = async (
  id,
  travelData
) => {
  try {
    const response = await api.put(
      `/travel-requests/${id}/`,
      travelData
    );

    return response.data;

  } catch (error) {
    console.error(
      "Error updating travel request:",
      error
    );

    throw error;
  }
};

/**
 * Delete travel request
 */
export const deleteTravelRequest = async (id) => {
  try {
    const response = await api.delete(
      `/travel-requests/${id}/`
    );

    return response.data;

  } catch (error) {
    console.error(
      "Error deleting travel request:",
      error
    );

    throw error;
  }
};

/**
 * Accept a helper for a travel request
 */
export const acceptHelper = async (travelRequestId, helperId, reason) => {
  try {
    const response = await api.post(
      `/travel-requests/${travelRequestId}/accept-helper/`,
      {
        helper_id: helperId,
        reason: reason,
      }
    );

    return response.data;

  } catch (error) {
    console.error("Error accepting helper:", error);
    throw error;
  }
};