require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");

const sampleProducts = [
  { name: "Study Table", sku: "FURN-TB-812", category: "Furniture", price: 3999, quantity: 2, reorderLevel: 4, supplier: "IKEA India" },
  { name: "Gel Pen Pack of 15", sku: "STNY-PN-713", category: "Stationery", price: 120, quantity: 48, reorderLevel: 20, supplier: "Cello Pens" },
  { name: "Wireless Mouse", sku: "ELEC-MS-101", category: "Electronics", price: 799, quantity: 15, reorderLevel: 5, supplier: "Logitech" },
  { name: "Notebook A4", sku: "STNY-NB-205", category: "Stationery", price: 85, quantity: 8, reorderLevel: 10, supplier: "Classmate" },
  { name: "Office Chair", sku: "FURN-CH-310", category: "Furniture", price: 5499, quantity: 12, reorderLevel: 3, supplier: "Godrej Interio" },
  { name: "USB-C Cable", sku: "ELEC-CB-220", category: "Electronics", price: 299, quantity: 30, reorderLevel: 8, supplier: "boAt" },
  { name: "Cotton T-Shirt", sku: "APRL-TS-501", category: "Apparel", price: 599, quantity: 6, reorderLevel: 10, supplier: "Campus Store" },
  { name: "Water Bottle", sku: "HOME-WB-330", category: "Home", price: 349, quantity: 25, reorderLevel: 6, supplier: "Milton" }
];

(async function seed() {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    console.log(`${sampleProducts.length} sample products inserted.`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
