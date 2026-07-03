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
    const response = await api.patch(
      `/travel-requests/${travelRequestId}/assign/`,
      {
        helper_id: helperId,
      }
    );
    return response.data;

  } catch (error) {
    console.error("Error accepting helper:", error);
    throw error;
  }
};

/**
 * Decline an AI recommendation
 */
export const declineHelper = async (travelRequestId) => {
  try {
    const response = await api.post(
      `/travel-requests/${travelRequestId}/helper-decline/`
    );

    return response.data;
  } catch (error) {
    console.error("Error declining helper:", error);
    throw error;
  }
};

/**
 * Accept a ride (Helper)
 */
export const acceptRide = async (travelRequestId) => {
  try {
    const response = await api.patch(
      `/travel-requests/${travelRequestId}/accept/`
    );
    return response.data;
  } catch (error) {
    console.error("Error accepting ride:", error);
    throw error;
  }
};

/**
 * Complete a ride (Helper)
 */
export const completeRide = async (travelRequestId) => {
  try {
    const response = await api.patch(
      `/travel-requests/${travelRequestId}/complete/`
    );
    return response.data;
  } catch (error) {
    console.error("Error completing ride:", error);
    throw error;
  }
};

/**
 * Get Certificate URL for a ride
 */
export const getRideCertificate = async (travelRequestId) => {
  try {
    const response = await api.get(
      `/travel-requests/${travelRequestId}/certificate/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching certificate:", error);
    throw error;
  }
};