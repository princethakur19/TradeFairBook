import api from "../api/axios";

export const getAllDomes = async () => {
  const response = await api.get("/domes");
  return response.data;
};
