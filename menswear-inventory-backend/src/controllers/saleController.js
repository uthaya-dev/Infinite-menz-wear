import Sale from "../models/sale.js";
import SaleItem from "../models/saleItem.js";
import Variant from "../models/variant.js";

// Create a sale
export const createSale = async (req, res) => {
  try {
    const { items, discount = 0, paymentMethod = "cash" } = req.body;

    console.log("REQ BODY:", JSON.stringify(req.body, null, 2));

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    // ✅ VALIDATE ITEMS FIRST
    for (const i of items) {
      if (!i?.variantId || typeof i?.qty !== "number") {
        return res.status(400).json({
          message: "Invalid item structure",
          item: i,
        });
      }
    }

    let totalAmount = 0;
    const invoiceNumber = `INV-${Date.now()}`;

    // ✅ CREATE SALE FIRST
    const sale = await Sale.create({
      invoiceNumber,
      totalAmount: 0,
      finalAmount: 0,
      discount,
      paymentMethod,
    });

    const saleItems = [];

    // ✅ NOW create sale items
    for (const i of items) {
      const variant = await Variant.findById(i.variantId);

      if (!variant) {
        return res.status(400).json({ message: "Variant not found" });
      }

      if (variant.stockQty < i.qty) {
        return res.status(400).json({
          message: `Not enough stock for ${variant.sku}`,
        });
      }

      const price = i.price ?? variant.sellingPrice;

      variant.stockQty -= i.qty;
      await variant.save();

      const total = price * i.qty;
      totalAmount += total;

      const saleItem = await SaleItem.create({
        saleId: sale._id,
        variantId: i.variantId,
        qty: i.qty,
        price,
        total,
      });

      saleItems.push(saleItem);
    }

    sale.totalAmount = totalAmount;
    sale.finalAmount = totalAmount - discount;
    await sale.save();

    res.status(201).json({
      saleId: sale._id,
      invoiceNumber,
      items: saleItems,
    });
  } catch (err) {
    console.error("CREATE SALE ERROR:", err);
    res.status(500).json({ message: err.message || "Server Error" });
  }
};

// Get a sale with items
export const getSale = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findById(id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    const items = await SaleItem.find({ saleId: id }).populate("variantId");

    res.json({ ...sale.toObject(), items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update sale
export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, discount, paymentMethod } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Items are required" });

    const sale = await Sale.findById(id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    // Fetch existing sale items
    const existingItems = await SaleItem.find({ saleId: id });

    // Revert stock changes
    for (const i of existingItems) {
      const variant = await Variant.findById(i.variantId);
      if (variant) variant.stockQty += i.qty; // add back previous sale qty
      await variant.save();
    }

    // Delete old sale items
    await SaleItem.deleteMany({ saleId: id });

    // Create new sale items and update stock
    let totalAmount = 0;
    for (const i of items) {
      const variant = await Variant.findById(i.variantId);
      if (!variant) continue;
      if (variant.stockQty < i.qty)
        return res
          .status(400)
          .json({ message: `Not enough stock for ${variant.sku}` });

      variant.stockQty -= i.qty; // reduce stock
      await variant.save();

      const price = i.price || variant.sellingPrice;
      totalAmount += price * i.qty;

      await SaleItem.create({
        saleId: id,
        variantId: i.variantId,
        qty: i.qty,
        price,
        total: price * i.qty,
      });
    }

    // Update sale record
    sale.discount = discount || 0;
    sale.paymentMethod = paymentMethod || sale.paymentMethod;
    sale.totalAmount = totalAmount;
    sale.finalAmount = totalAmount - (discount || 0);
    await sale.save();

    res.json({ message: "Sale updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server Error" });
  }
};

// Get all sales
export const getSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    const items = await SaleItem.find({ saleId: id }).populate("variantId");

    res.json({
      ...sale._doc,
      items: items.map((i) => ({
        ...i._doc,
        sku: i.variantId?.sku,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
