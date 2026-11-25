require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json({ limit: "10kb" }));
app.use(logger);

app.get("/", (req, res) => res.status(200).json({
  success: true,
  message: "Inventory and Data Management API is running",
  endpoints: {
    products: "/api/products",
    lowStock: "/api/products/low-stock",
    categorySummary: "/api/products/summary",
    stockAdjustment: "PATCH /api/products/:id/stock"
  }
}));

app.use("/api/products", productRoutes);
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Inventory API running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
}
if (require.main === module) startServer();
module.exports = app;
