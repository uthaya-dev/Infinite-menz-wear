import Product from "../models/product.js";
import Variant from "../models/Variant.js";
import Master from "../models/Master.js";
import { generateSKU } from "../utils/generateSKU.js";

export const createProduct = async (req, res) => {
  try {
    const { name, categoryId, brandId, description, variants } = req.body;

    // ❌ VALIDATION
    if (!name || !categoryId || !variants || variants.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Get category name (for SKU)
    const category = await Master.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // ✅ Create product
    const product = await Product.create({
      name,
      categoryId,
      brandId,
      description,
    });

    const variantData = [];

    const seen = new Set(); // prevent duplicates inside request

    for (let v of variants) {
      const { size, color, stockQty, purchasePrice, sellingPrice } = v;

      // ❌ VALIDATION
      if (!size || !color) {
        return res.status(400).json({ message: "Size and color required" });
      }

      if (stockQty < 0) {
        return res.status(400).json({ message: "Invalid stock" });
      }

      // ❌ Duplicate variant check (same size + color)
      const key = `${size}-${color}`;
      if (seen.has(key)) {
        return res.status(400).json({ message: `Duplicate variant: ${key}` });
      }
      seen.add(key);

      // 🔥 Generate SKU
      const sku = generateSKU({
        categoryName: category.name,
        color,
        size,
      });

      variantData.push({
        productId: product._id,
        size,
        color,
        sku,
        stockQty: stockQty || 0,
        purchasePrice,
        sellingPrice,
      });
    }

    // ❌ Check SKU duplicates in DB
    const existingSKUs = await Variant.find({
      sku: { $in: variantData.map((v) => v.sku) },
    });

    if (existingSKUs.length > 0) {
      return res.status(400).json({
        message: "SKU already exists",
      });
    }

    // ✅ Insert variants
    await Variant.insertMany(variantData);

    res.status(201).json({
      message: "Product created successfully",
      productId: product._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PRODUCTS + VARIANTS
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("categoryId brandId");

    const variants = await Variant.find();

    const result = products.map((p) => ({
      ...p._doc,
      variants: variants.filter(
        (v) => v.productId.toString() === p._id.toString(),
      ),
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE PRODUCT + VARIANTS
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await Product.findByIdAndDelete(id);
    await Variant.deleteMany({ productId: id });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: ADD VARIANT
export const addVariant = async (req, res) => {
  try {
    const { id } = req.params; // product id
    const { variants } = req.body;

    if (!variants || variants.length === 0)
      return res.status(400).json({ message: "No variants provided" });

    const product = await Product.findById(id).populate("categoryId");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const variantData = [];
    const seen = new Set();

    for (let v of variants) {
      const {
        size,
        color,
        stockQty = 0,
        purchasePrice = 0,
        sellingPrice = 0,
      } = v;

      if (!size || !color)
        return res.status(400).json({ message: "Size and color required" });

      const key = `${size}-${color}`;
      if (seen.has(key))
        return res.status(400).json({ message: `Duplicate variant: ${key}` });
      seen.add(key);

      const sku = generateSKU({
        categoryName: product.categoryId.name,
        color,
        size,
      });

      variantData.push({
        productId: product._id,
        size,
        color,
        sku,
        stockQty,
        purchasePrice,
        sellingPrice,
      });
    }

    const existingSKUs = await Variant.find({
      sku: { $in: variantData.map((v) => v.sku) },
    });
    if (existingSKUs.length > 0)
      return res.status(400).json({ message: "SKU already exists" });

    await Variant.insertMany(variantData);
    res.json({ message: "Variant(s) added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EDIT VARIANT
export const editVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { size, color, stockQty, purchasePrice, sellingPrice } = req.body;

    const variant = await Variant.findOne({ _id: variantId, productId });
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    // Prevent duplicate size+color
    const duplicate = await Variant.findOne({
      productId,
      size,
      color,
      _id: { $ne: variantId },
    });
    if (duplicate)
      return res.status(400).json({ message: "Duplicate variant exists" });

    // Update fields
    variant.size = size || variant.size;
    variant.color = color || variant.color;
    variant.stockQty = stockQty != null ? stockQty : variant.stockQty;
    variant.purchasePrice =
      purchasePrice != null ? purchasePrice : variant.purchasePrice;
    variant.sellingPrice =
      sellingPrice != null ? sellingPrice : variant.sellingPrice;

    await variant.save();

    res.json({ message: "Variant updated successfully", variant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: DELETE VARIANT
export const deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const variant = await Variant.findOne({ _id: variantId, productId });
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    await variant.deleteOne();
    res.json({ message: "Variant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchVariants = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.json([]);

    const variants = await Variant.find()
      .populate("productId", "name")
      .limit(50); // fetch some

    const search = q.toLowerCase();

    const filtered = variants.filter((v) => {
      const sku = v.sku?.toLowerCase() || "";
      const name = v.productId?.name?.toLowerCase() || "";
      const size = v.size?.toLowerCase() || "";
      const color = v.color?.toLowerCase() || "";

      return (
        sku.includes(search) ||
        name.includes(search) ||
        size.includes(search) ||
        color.includes(search)
      );
    });

    const result = filtered.slice(0, 10).map((v) => ({
      _id: v._id,
      sku: v.sku,
      productName: v.productId?.name,
      size: v.size,
      color: v.color,
      price: v.sellingPrice,
      stock: v.stockQty,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
