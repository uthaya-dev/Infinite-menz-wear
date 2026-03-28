import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import Variant from "../models/Variant.js";
import SaleItem from "../models/SaleItem.js";

export const getDashboard = async (req, res) => {
  try {
    const now = new Date();

    // 🗓️ Date ranges
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);

    const startWeek = new Date();
    startWeek.setDate(now.getDate() - 7);

    const startMonth = new Date();
    startMonth.setMonth(now.getMonth() - 1);

    // ✅ SALES (today, week, month)
    const salesData = await Sale.aggregate([
      {
        $facet: {
          today: [
            { $match: { createdAt: { $gte: startToday } } },
            { $group: { _id: null, total: { $sum: "$finalAmount" } } },
          ],
          week: [
            { $match: { createdAt: { $gte: startWeek } } },
            { $group: { _id: null, total: { $sum: "$finalAmount" } } },
          ],
          month: [
            { $match: { createdAt: { $gte: startMonth } } },
            { $group: { _id: null, total: { $sum: "$finalAmount" } } },
          ],
        },
      },
    ]);

    const todaySales = salesData[0].today[0]?.total || 0;
    const weekSales = salesData[0].week[0]?.total || 0;
    const monthSales = salesData[0].month[0]?.total || 0;

    // ✅ TOTAL SALES
    const totalSalesAgg = await Sale.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$finalAmount" },
        },
      },
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;

    // ✅ TOTAL PURCHASE
    const totalPurchaseAgg = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);
    const totalPurchase = totalPurchaseAgg[0]?.total || 0;

    // ✅ PROFIT (correct way)
    const profitAgg = await SaleItem.aggregate([
      {
        $lookup: {
          from: "variants",
          localField: "variantId",
          foreignField: "_id",
          as: "variant",
        },
      },
      { $unwind: "$variant" },
      {
        $group: {
          _id: null,
          profit: {
            $sum: {
              $subtract: [
                { $multiply: ["$price", "$qty"] },
                { $multiply: ["$variant.purchasePrice", "$qty"] },
              ],
            },
          },
        },
      },
    ]);
    const profit = profitAgg[0]?.profit || 0;

    // ✅ LOW STOCK
    const lowStockCount = await Variant.countDocuments({
      stockQty: { $lte: 5 },
    });

    // ✅ DEAD STOCK (not sold in 30 days)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const soldItems = await SaleItem.distinct("variantId", {
      createdAt: { $gte: last30Days },
    });

    const deadStockCount = await Variant.countDocuments({
      _id: { $nin: soldItems },
    });

    // ✅ CLEARANCE STOCK (adjustable logic)
    const clearanceStockCount = await Variant.countDocuments({
      stockQty: { $gt: 5 },
      _id: { $nin: soldItems },
    });

    // ✅ TOP PRODUCTS
    const topProducts = await SaleItem.aggregate([
      {
        $group: {
          _id: "$variantId",
          sold: { $sum: "$qty" },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
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
        },
      },
    ]);

    res.json({
      todaySales,
      weekSales,
      monthSales,
      totalSales,
      totalPurchase,
      profit,
      lowStockCount,
      deadStockCount,
      clearanceStockCount,
      topProducts,
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
