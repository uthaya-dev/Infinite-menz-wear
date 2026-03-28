import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import SaleItem from "../models/SaleItem.js";

export const getSalesReport = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  try {
    const { startDate, endDate } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // ✅ Sales in range
    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await Sale.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    for (let sale of sales) {
      const items = await SaleItem.find({ saleId: sale._id }).populate(
        "variantId",
      );

      sale.items = items.map((i) => ({
        name: i.variantId?.sku,
        qty: i.qty,
        price: i.price,
        total: i.total,
      }));
    }

    // ✅ Total sales
    const totalSalesAgg = await Sale.aggregate([
      {
        $match: { createdAt: { $gte: start, $lte: end } },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalAmount" },
        },
      },
    ]);

    const totalSales = totalSalesAgg[0]?.total || 0;

    // ✅ Profit calculation
    const saleItems = await SaleItem.find({
      createdAt: { $gte: start, $lte: end },
    }).populate("variantId");

    let profit = 0;

    for (let item of saleItems) {
      if (!item.variantId) continue;

      const selling = item.price * item.qty;
      const cost = item.variantId.purchasePrice * item.qty;

      profit += selling - cost;
    }

    res.json({
      totalSales,
      profit,
      count: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      sales,
    });
  } catch (err) {
    console.error("REPORT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getPurchaseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const purchases = await Purchase.find({
      createdAt: { $gte: start, $lte: end },
    });

    const totalPurchase = purchases.reduce(
      (sum, p) => sum + (p.totalAmount || 0),
      0,
    );

    res.json({
      totalPurchase,
      count: purchases.length,
      purchases,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
