import Purchase from "../models/purchase.js";
import PurchaseItem from "../models/purchaseItem.js";
import Variant from "../models/variant.js";

// Create a purchase
export const createPurchase = async (req, res) => {
  try {
    const { supplierId, items } = req.body;

    if (!supplierId || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Supplier and items are required" });
    }

    // Calculate totalAmount
    let totalAmount = 0;
    items.forEach((i) => {
      i.total = i.qty * i.purchasePrice;
      totalAmount += i.total;
    });

    // Create purchase
    const purchase = await Purchase.create({
      supplierId,
      items,
    });

    // Create purchase items
    const purchaseItems = await Promise.all(
      items.map(async (i) => {
        // Update stock in variant
        const variant = await Variant.findById(i.variantId);
        variant.stockQty += i.qty;
        variant.purchasePrice = i.purchasePrice; // optional: update purchasePrice
        await variant.save();

        return PurchaseItem.create({
          purchaseId: purchase._id,
          variantId: i.variantId,
          qty: i.qty,
          purchasePrice: i.purchasePrice,
          total: i.total,
        });
      }),
    );

    res.status(201).json({ purchaseId: purchase._id, items: purchaseItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get a purchase with items
export const getPurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await Purchase.findById(id);
    if (!purchase)
      return res.status(404).json({ message: "Purchase not found" });

    const items = await PurchaseItem.find({ purchaseId: id }).populate(
      "variantId",
    );

    res.json({ ...purchase.toObject(), items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update purchase
export const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplierName, items } = req.body;

    if (!supplierName || !items || items.length === 0)
      return res
        .status(400)
        .json({ message: "Supplier and items are required" });

    const purchase = await Purchase.findById(id);
    if (!purchase)
      return res.status(404).json({ message: "Purchase not found" });

    // Fetch existing items
    const existingItems = await PurchaseItem.find({ purchaseId: id });

    // Revert stock changes from existing items
    for (const i of existingItems) {
      const variant = await Variant.findById(i.variantId);
      if (variant) variant.stockQty -= i.qty; // revert previous purchase
      await variant.save();
    }

    // Delete old purchase items
    await PurchaseItem.deleteMany({ purchaseId: id });

    // Create new purchase items and update stock
    let totalAmount = 0;
    for (const i of items) {
      const variant = await Variant.findById(i.variantId);
      if (!variant) continue;

      variant.stockQty += i.qty; // add new quantity
      variant.purchasePrice = i.purchasePrice; // optional: update price
      await variant.save();

      const total = i.qty * i.purchasePrice;
      totalAmount += total;

      await PurchaseItem.create({
        purchaseId: id,
        variantId: i.variantId,
        qty: i.qty,
        purchasePrice: i.purchasePrice,
        total,
      });
    }

    // Update purchase record
    purchase.supplierName = supplierName;
    purchase.totalAmount = totalAmount;
    await purchase.save();

    res.json({ message: "Purchase updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all purchases
export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplierId", "name") // ✅ ADD THIS
      .populate("items.variantId"); // already correct

    res.json(purchases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
