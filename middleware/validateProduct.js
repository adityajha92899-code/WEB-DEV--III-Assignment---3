const allowed = ["name", "sku", "category", "price", "quantity", "reorderLevel", "supplier"];
module.exports = function validateProduct(req, res, next) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
    return res.status(400).json({ success: false, message: "Request body must be a JSON object" });
  const unknown = Object.keys(req.body).filter(key => !allowed.includes(key));
  if (unknown.length) return res.status(400).json({ success: false, message: "Unknown field(s)", fields: unknown });
  next();
};
