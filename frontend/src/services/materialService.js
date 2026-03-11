import api from "../api/axios";

export const getActiveMaterialsByDome = async (domeId) => {
  const response = await api.get("/materials", {
    params: {
      dome: domeId,
      activeOnly: true
    }
  });

  return Array.isArray(response.data?.data) ? response.data.data : [];
};
