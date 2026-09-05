const DEFAULT_LAYOUT = {
  top: 5,
  left: 7,
  right: 7,
  centerRows: 4,
  centerSpacing: "with-space"
};

const createStall = (domeId, index, stallNumber, side, price) => ({
  _id: `${domeId.slice(0, 18)}${domeId.slice(-2)}${index.toString(16).padStart(4, "0")}`,
  stallNumber,
  side,
  price,
  status: "AVAILABLE",
  dome: domeId,
  centerSpacing: DEFAULT_LAYOUT.centerSpacing
});

const buildDefaultStallsForDome = (domeId) => {
  const stalls = [];
  let index = 1;

  for (let i = 1; i <= DEFAULT_LAYOUT.top; i += 1) {
    stalls.push(createStall(domeId, index, `T${i}`, "TOP", 7000));
    index += 1;
  }

  for (let i = 1; i <= DEFAULT_LAYOUT.left; i += 1) {
    stalls.push(createStall(domeId, index, `L${i}`, "LEFT", 5000));
    index += 1;
  }

  for (let i = 1; i <= DEFAULT_LAYOUT.right; i += 1) {
    stalls.push(createStall(domeId, index, `R${i}`, "RIGHT", 5000));
    index += 1;
  }

  for (let i = 1; i <= DEFAULT_LAYOUT.centerRows * 2; i += 1) {
    stalls.push(createStall(domeId, index, `C${i}`, "CENTER", 6000));
    index += 1;
  }

  return stalls;
};

module.exports = {
  DEFAULT_LAYOUT,
  buildDefaultStallsForDome
};
