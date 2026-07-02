import api from "./api";

/**
 * Generate AI helper recommendations for a travel request
 */
export const recommendHelper = async (travelRequestId) => {
  try {
    const response = await api.post("/ai/recommend-helper/", {
      travel_request_id: travelRequestId,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating helper recommendations:", error);
    throw error;
  }
};

/**
 * Get existing helper recommendations for a travel request
 */
export const getRecommendation = async (travelRequestId) => {
  try {
    const response = await api.get(`/ai/recommend-helper/`, {
      params: { travel_request_id: travelRequestId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching helper recommendations:", error);
    throw error;
  }
};
