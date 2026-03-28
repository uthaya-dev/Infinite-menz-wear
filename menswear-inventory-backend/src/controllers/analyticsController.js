import SaleItem from "../models/SaleItem.js";
import Variant from "../models/Variant.js";

export const getAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    // 🔥 FAST MOVING
    const fastMoving = await SaleItem.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: "$variantId",
          sold: { $sum: "$qty" },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "variants",
          localField: "_id",
          foreignField: "_id",
          as: "variant",
        },
      },
      { $unwind: "$variant" },
      {
        $project: {
          name: "$variant.sku",
          sold: 1,
          stock: "$variant.stockQty",
        },
      },
    ]);

    // 🐢 SLOW MOVING
    const slowMoving = await SaleItem.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: "$variantId",
          sold: { $sum: "$qty" },
        },
      },
      { $match: { sold: { $lte: 2 } } },
      {
        $lookup: {
          from: "variants",
          localField: "_id",
          foreignField: "_id",
          as: "variant",
        },
      },
      { $unwind: "$variant" },
      {
        $project: {
          name: "$variant.sku",
          sold: 1,
          stock: "$variant.stockQty",
        },
      },
    ]);

    // 🧊 DEAD STOCK
    const soldIds = await SaleItem.distinct("variantId", {
      createdAt: { $gte: fromDate },
    });

    const deadStock = await Variant.find({
      _id: { $nin: soldIds },
    }).select("sku stockQty");

    // 🏷️ CLEARANCE (smart logic)
    const clearance = await Variant.find({
      stockQty: { $gt: 5 },
      _id: { $nin: soldIds },
    }).select("sku stockQty");

    // 📊 KPI CALCULATIONS
    const totalVariants = await Variant.countDocuments();

    const fastCount = fastMoving.length;
    const slowCount = slowMoving.length;
    const deadCount = deadStock.length;

    res.json({
      kpis: {
        totalVariants,
        fastCount,
        slowCount,
        deadCount,
      },
      fastMoving,
      slowMoving,
      deadStock,
      clearance,
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
