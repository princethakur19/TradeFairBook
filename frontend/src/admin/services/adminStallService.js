import api from "../../api/axios";

/* ======================================================
   Generate stall array (C-shape style)
====================================================== */
export const generateStallArray = (config) => {
  const { topCount, centerCount, leftCount, rightCount, domeId } = config;

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

  /* -------- CENTER STALLS (🔥 FIXED) -------- */
  // Each center row has 2 stalls
  const totalCenterStalls = (centerCount || 0) * 2;

  for (let i = 1; i <= totalCenterStalls; i++) {
    stalls.push({
      stallNumber: `C${i}`,
      side: "CENTER",   // MUST BE UPPERCASE (matches enum)
      price: 6000,
      status: "AVAILABLE",
      dome: domeId,
    });
  }

  return stalls;
};


/* ======================================================
   Save stalls to databasee
====================================================== */
export const saveStallsToDB = async (stalls) => {
  try {
    const response = await api.post("/stalls", stalls);
    return response.data;
  } catch (error) {
    console.error(
      "Error saving stalls:",
      error.response?.data || error.message
    );
    throw error;
  }
};


/* ======================================================
   Get stalls by dome (🔥 FIX ROUTE)
====================================================== */
export const getStallsByDome = async (domeId) => {
  try {
    // Backend route is: /api/stalls/dome/:domeId
    const response = await api.get(`/stalls/dome/${domeId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching stalls:",
      error.response?.data || error.message
    );
    throw error;
  }
};
