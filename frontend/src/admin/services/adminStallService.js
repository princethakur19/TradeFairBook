import api from "../../api/axios";

/* Generate stall array (C-shape style) */
export const generateStallArray = (config) => {
  const { topCount, leftCount, rightCount, domeId } = config;

  if (!domeId) {
    alert("Please select a dome first.");
    return [];
  }

  const stalls = [];

  /* -------- TOP ROW -------- */
  for (let i = 1; i <= topCount; i++) {
    stalls.push({
      stallNumber: `T${i}`,
      side: "TOP",
      price: 7000,
      status: "AVAILABLE",
      dome: domeId,
    });
  }

  /* -------- LEFT COLUMN -------- */
  for (let i = 1; i <= leftCount; i++) {
    stalls.push({
      stallNumber: `L${i}`,
      side: "LEFT",
      price: 5000,
      status: "AVAILABLE",
      dome: domeId,
    });
  }

  /* -------- RIGHT COLUMN -------- */
  for (let i = 1; i <= rightCount; i++) {
    stalls.push({
      stallNumber: `R${i}`,
      side: "RIGHT",
      price: 5000,
      status: "AVAILABLE",
      dome: domeId,
    });
  }

  return stalls;
};


/* Save stalls to database */
export const saveStallsToDB = async (stalls) => {
  try {
    const response = await api.post("/stalls", stalls);
    return response.data;
  } catch (error) {
    console.error("Error saving stalls:", error.response?.data || error.message);
    throw error;
  }
};


/* Get stalls by dome */
export const getStallsByDome = async (domeId) => {
  try {
    const response = await api.get(`/stalls/${domeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stalls:", error.response?.data || error.message);
    throw error;
  }
};
