import api from "../../api/axios";

export const getAllMaterials = async () => {
  const response = await api.get("/materials");
  return response.data;
};

export const createMaterial = async (materialData) => {
  const response = await api.post("/materials", materialData);
  return response.data;
};

export const updateMaterial = async (materialId, materialData) => {
  const response = await api.put(`/materials/${materialId}`, materialData);
  return response.data;
};

export const deleteMaterial = async (materialId) => {
  const response = await api.delete(`/materials/${materialId}`);
  return response.data;
};
