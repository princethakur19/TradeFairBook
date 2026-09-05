import api from "../api/axios";
import { buildDefaultMaterialsForDome } from "../data/defaultMaterials";

export const getActiveMaterialsByDome = async (domeId) => {
  try {
    const response = await api.get("/materials", {
      params: {
        dome: domeId,
        activeOnly: true
      }
    });

    return Array.isArray(response.data?.data) ? response.data.data : [];
  } catch (error) {
    console.error("Error fetching materials:", error);
    return buildDefaultMaterialsForDome(domeId);
  }
};
