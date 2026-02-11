//Keeps API logic separate from UI (good architecture).
import axios from "axios";

const API_URL = "http://localhost:5000/api/domes";

export const getAllDomes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
