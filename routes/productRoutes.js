const router = require("express").Router();
const c = require("../controllers/productController");
const validateProduct = require("../middleware/validateProduct");

// Keep fixed paths before /:id.
router.get("/low-stock", c.getLowStockProducts);
router.get("/summary", c.getCategorySummary);
router.post("/", validateProduct, c.createProduct);
router.get("/", c.getProducts);
router.get("/:id", c.getProductById);
router.put("/:id", validateProduct, c.updateProduct);
router.patch("/:id/stock", c.adjustStock);
router.delete("/:id", c.deleteProduct);
module.exports = router;
