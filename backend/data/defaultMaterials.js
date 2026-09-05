const defaultMaterialTemplates = [
  {
    name: "Extra Table",
    price: 200,
    description: "Additional wooden table",
    isActive: true
  },
  {
    name: "Extra Chair",
    price: 100,
    description: "Additional visitor chair",
    isActive: true
  },
  {
    name: "Fan",
    price: 50,
    description: "Cooling fan for stall comfort",
    isActive: true
  },
  {
    name: "LED Light",
    price: 50,
    description: "Additional LED lighting",
    isActive: true
  }
];

const buildDefaultMaterialsForDome = (domeId) => defaultMaterialTemplates.map((material, index) => ({
  _id: `${String(domeId).slice(0, 20)}${(index + 101).toString(16).padStart(4, "0")}`,
  ...material,
  dome: domeId
}));

module.exports = {
  defaultMaterialTemplates,
  buildDefaultMaterialsForDome
};
