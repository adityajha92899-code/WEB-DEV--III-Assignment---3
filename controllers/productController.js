const mongoose = require("mongoose");
const Product = require("../models/Product");

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, message: "Product created successfully", data: product });
  } catch (err) { next(err); }
}

async function getProducts(req, res, next) {
  try {
    const { category, search, minPrice, maxPrice, sort = "createdAt", order = "desc", page = "1", limit = "10" } = req.query;
    const p = Number(page), l = Number(limit);
    if (!Number.isInteger(p) || p < 1 || !Number.isInteger(l) || l < 1 || l > 100)
      return res.status(400).json({ success: false, message: "page must be >= 1 and limit must be between 1 and 100" });

    const filter = {};
    if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
    if (search) {
      const term = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ name: term }, { sku: term }, { supplier: term }];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        const n = Number(minPrice);
        if (!Number.isFinite(n) || n < 0) return res.status(400).json({ success: false, message: "minPrice must be non-negative" });
        filter.price.$gte = n;
      }
      if (maxPrice !== undefined) {
        const n = Number(maxPrice);
        if (!Number.isFinite(n) || n < 0) return res.status(400).json({ success: false, message: "maxPrice must be non-negative" });
        filter.price.$lte = n;
      }
      if (filter.price.$gte > filter.price.$lte) return res.status(400).json({ success: false, message: "minPrice cannot exceed maxPrice" });
    }
    const sortFields = ["name", "price", "quantity", "category", "createdAt", "updatedAt"];
    if (!sortFields.includes(sort) || !["asc", "desc"].includes(order))
      return res.status(400).json({ success: false, message: "Invalid sort field or order" });

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ [sort]: order === "asc" ? 1 : -1 }).skip((p - 1) * l).limit(l),
      Product.countDocuments(filter)
    ]);
    res.status(200).json({ success: true, total, page: p, totalPages: Math.ceil(total / l), count: products.length, products });
  } catch (err) { next(err); }
}

async function getProductById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: product });
  } catch (err) { next(err); }
}

async function updateProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product updated successfully", data: product });
  } catch (err) { next(err); }
}

async function deleteProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product deleted", id: product._id });
  } catch (err) { next(err); }
}

async function getLowStockProducts(req, res, next) {
  try {
    const products = await Product.find({ $expr: { $lte: ["$quantity", "$reorderLevel"] } }).sort({ quantity: 1 });
    res.status(200).json({ success: true, count: products.length, lowStockItems: products });
  } catch (err) { next(err); }
}

async function getCategorySummary(req, res, next) {
  try {
    const summary = await Product.aggregate([
      { $group: {
        _id: "$category", totalItems: { $sum: 1 }, totalQuantity: { $sum: "$quantity" },
        totalStockValue: { $sum: { $multiply: ["$price", "$quantity"] } }, avgPrice: { $avg: "$price" }
      }},
      { $sort: { _id: 1 } },
      { $project: { _id: 0, category: "$_id", totalItems: 1, totalQuantity: 1,
        totalStockValue: { $round: ["$totalStockValue", 2] }, avgPrice: { $round: ["$avgPrice", 2] } } }
    ]);
    res.status(200).json({ success: true, categories: summary.length, summary });
  } catch (err) { next(err); }
}

async function adjustStock(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const change = req.body?.change;
    if (!Number.isInteger(change) || change === 0)
      return res.status(400).json({ success: false, message: "change must be a non-zero integer (positive restock, negative sale)" });

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, quantity: { $gte: Math.max(0, -change) } },
      { $inc: { quantity: change } }, { new: true, runValidators: true }
    );
    if (!product) {
      const exists = await Product.exists({ _id: req.params.id });
      if (!exists) return res.status(404).json({ success: false, message: "Product not found" });
      return res.status(400).json({ success: false, message: "Insufficient stock: quantity cannot become negative" });
    }
    res.status(200).json({ success: true, message: change > 0 ? "Stock restocked successfully" : "Stock sale recorded successfully", data: product });
  } catch (err) { next(err); }
}

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getLowStockProducts, getCategorySummary, adjustStock };
