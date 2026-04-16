import Variant from "../models/Variant.js";

export const generateSKU = async ({ categoryName, color, size }) => {
  if (!categoryName || !color || !size) {
    throw new Error("Invalid SKU data");
  }

  // 🔹 Brand code (fixed)
  const brandCode = "INF";

  // 🔹 Category code (first letters of words)
  const categoryCode = categoryName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  // 🔹 Color code
  const colorCode = color.slice(0, 3).toUpperCase();

  // 🔹 Date code (YYMM)
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const dateCode = `${year}${month}`;

  const baseSKU = `${brandCode}-${categoryCode}-${colorCode}-${size}-${dateCode}`;

  // 🔥 Count existing SKUs
  const count = await Variant.countDocuments({
    sku: new RegExp(`^${baseSKU}`),
  });

  const number = String(count + 1).padStart(3, "0");

  return `${baseSKU}-${number}`;
};
