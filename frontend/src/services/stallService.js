import api from "../api/axios";

export const getStallsByDome = async (domeId) => {
  try {
    const response = await api.get(`/stalls/${domeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stalls:", error);
    throw error;
  }
};
