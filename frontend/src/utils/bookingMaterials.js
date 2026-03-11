export const DEFAULT_INCLUDED_MATERIALS = Object.freeze([
  { name: "Table", quantity: 1 },
  { name: "Chair", quantity: 2 },
  { name: "Fan", quantity: 1 },
  { name: "Light", quantity: 1 }
]);

export const getExtraMaterialsTotal = (materials = []) =>
  materials.reduce((sum, material) => sum + Number(material.subtotal || 0), 0);

export const getGrandTotal = (stallAmount = 0, extraAmount = 0) =>
  Number(stallAmount || 0) + Number(extraAmount || 0);

export const buildSelectedExtraMaterials = (materials = [], quantities = {}) =>
  materials
    .map((material) => {
      const quantity = Number.parseInt(quantities?.[material._id] || 0, 10);
      const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
      const price = Number(material.price || 0);

      if (!safeQuantity) return null;

      return {
        materialId: material._id,
        name: material.name,
        price,
        quantity: safeQuantity,
        subtotal: price * safeQuantity
      };
    })
    .filter(Boolean);
