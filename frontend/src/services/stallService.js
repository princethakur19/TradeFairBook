import api from "../api/axios";
import { buildDefaultStallsForDome } from "../data/defaultStalls";

export const getStallsByDome = async (domeId) => {
  try {
    const response = await api.get(`/stalls/${domeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stalls:", error);
    const stalls = buildDefaultStallsForDome(domeId);

    return {
      success: true,
      count: stalls.length,
      data: stalls,
      fallback: true
    };
  }
};
