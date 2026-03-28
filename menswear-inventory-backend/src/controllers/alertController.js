import Variant from "../models/Variant.js";
import SaleItem from "../models/SaleItem.js";

export const getAlerts = async (req, res) => {
  try {
    const lowStockLimit = 5;

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    // 🚨 LOW STOCK
    const lowStock = await Variant.find({
      stockQty: { $gt: 0, $lte: lowStockLimit },
    }).select("sku stockQty");

    // ❌ OUT OF STOCK
    const outOfStock = await Variant.find({
      stockQty: 0,
    }).select("sku");

    // 🧊 DEAD STOCK
    const soldIds = await SaleItem.distinct("variantId", {
      createdAt: { $gte: last30Days },
    });

    const deadStock = await Variant.find({
      _id: { $nin: soldIds },
      stockQty: { $gt: 0 },
    }).select("sku stockQty");

    // 🔥 FAST SELLING BUT LOW STOCK
    const fastSelling = await SaleItem.aggregate([
      {
        $match: { createdAt: { $gte: last30Days } },
      },
      {
        $group: {
          _id: "$variantId",
          sold: { $sum: "$qty" },
        },
      },
      { $match: { sold: { $gte: 10 } } }, // threshold
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
        $match: { "variant.stockQty": { $lte: lowStockLimit } },
      },
      {
        $project: {
          name: "$variant.sku",
          sold: 1,
          stock: "$variant.stockQty",
        },
      },
    ]);

    res.json({
      lowStock,
      outOfStock,
      deadStock,
      fastSelling,
    });
  } catch (err) {
    console.error("ALERT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
