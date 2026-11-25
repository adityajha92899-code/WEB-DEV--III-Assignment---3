const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Product name is required"], trim: true, minlength: 2, maxlength: 100 },
  sku: { type: String, required: [true, "SKU is required"], unique: true, trim: true, uppercase: true,
    match: [/^[A-Z0-9-]{3,30}$/, "SKU must be 3-30 letters, numbers, or hyphens"] },
  category: { type: String, required: [true, "Category is required"], trim: true, maxlength: 60 },
  price: { type: Number, required: [true, "Price is required"], min: [0, "Price cannot be negative"] },
  quantity: { type: Number, required: [true, "Quantity is required"], min: 0, validate: Number.isInteger },
  reorderLevel: { type: Number, required: [true, "Reorder level is required"], min: 0, validate: Number.isInteger },
  supplier: { type: String, required: [true, "Supplier is required"], trim: true, maxlength: 100 }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual("stockValue").get(function () { return this.price * this.quantity; });
productSchema.index({ name: "text", sku: "text", category: "text" });
productSchema.index({ category: 1, price: 1 });
module.exports = mongoose.model("Product", productSchema);
