import api from "../../api/axios";

/* ===========================
   CREATE DOME
=========================== */
export const createDome = async (domeData) => {
  try {
    const response = await api.post("/domes", domeData);

    return response.data; // { success, message, data }

  } catch (error) {
    console.error("Create Dome Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to create dome" };
  }
};


/* ===========================
   GET ALL DOMES
=========================== */
export const getAllDomes = async () => {
  try {
    const response = await api.get("/domes");

    // backend returns:
    // { success: true, count: X, data: [...] }

    return response.data.data; // return only array

  } catch (error) {
    console.error("Get Domes Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to fetch domes" };
  }
};
