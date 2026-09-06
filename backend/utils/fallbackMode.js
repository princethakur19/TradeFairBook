const isFallbackDataEnabled = () =>
  String(process.env.USE_FALLBACK_DATA || "true").toLowerCase() !== "false";

module.exports = {
  isFallbackDataEnabled
};
