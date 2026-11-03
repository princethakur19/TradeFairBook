const crypto = require("crypto");
const defaultDomes = require("./defaultDomes");
const { buildDefaultStallsForDome } = require("./defaultStalls");

const stallsById = new Map();
const clone = (value) => JSON.parse(JSON.stringify(value));

const ensureDefaults = () => {
  for (const dome of defaultDomes) {
    for (const stall of buildDefaultStallsForDome(dome._id)) {
      if (!stallsById.has(stall._id)) {
        stallsById.set(stall._id, { ...stall, dome: clone(dome) });
      }
    }
  }
};

const getAllFallbackStalls = () => {
  ensureDefaults();
  return clone([...stallsById.values()]);
};

const getFallbackStallsByDome = (domeId) =>
  getAllFallbackStalls().filter((stall) => String(stall.dome?._id || stall.dome) === String(domeId));

const getFallbackStallById = (stallId) => {
  ensureDefaults();
  const stall = stallsById.get(String(stallId));
  return stall ? clone(stall) : null;
};

const createFallbackStalls = (stalls) => {
  ensureDefaults();
  const created = [];
  for (const input of Array.isArray(stalls) ? stalls : [stalls]) {
    const domeId = String(input?.dome?._id || input?.dome || "");
    const dome = defaultDomes.find((entry) => entry._id === domeId);
    if (!dome || !input?.stallNumber) continue;
    if ([...stallsById.values()].some((stall) => String(stall.dome?._id) === domeId && stall.stallNumber === input.stallNumber)) {
      const error = new Error("Some stalls already exist in this dome.");
      error.code = 11000;
      throw error;
    }
    const stall = {
      ...input,
      _id: crypto.randomBytes(12).toString("hex"),
      dome: clone(dome),
      status: input.status || "AVAILABLE"
    };
    stallsById.set(stall._id, stall);
    created.push(clone(stall));
  }
  return created;
};

const updateFallbackStall = (stallId, updates) => {
  ensureDefaults();
  const stall = stallsById.get(String(stallId));
  if (!stall) return null;
  const updated = { ...stall, ...updates };
  stallsById.set(String(stallId), updated);
  return clone(updated);
};

const deleteFallbackStall = (stallId) => {
  ensureDefaults();
  const stall = stallsById.get(String(stallId));
  if (!stall) return null;
  stallsById.delete(String(stallId));
  return clone(stall);
};

module.exports = {
  getAllFallbackStalls,
  getFallbackStallsByDome,
  getFallbackStallById,
  createFallbackStalls,
  updateFallbackStall,
  deleteFallbackStall
};
