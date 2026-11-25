module.exports = function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`);
  if (err.name === "ValidationError") return res.status(400).json({
    success: false, message: "Validation failed",
    errors: Object.values(err.errors).map(e => e.message)
  });
  if (err.name === "CastError") return res.status(400).json({ success: false, message: "Invalid product ID" });
  if (err.code === 11000) return res.status(409).json({ success: false, message: "A product with this SKU already exists" });
  if (err instanceof SyntaxError && err.status === 400 && "body" in err)
    return res.status(400).json({ success: false, message: "Invalid JSON request body" });
  return res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
};
