import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  let totalUsers = 0,
    totalOrders = 0,
    products = [];

  try {
    totalUsers = await User.countDocuments();
    totalOrders = await Order.countDocuments();
    products = await Product.find({}, "createdAt stock");
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching dashboard data", error: err.message });
  }

  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("items.product", "gallery name category");

  // Monthly sales
  const monthlySales = Array(12).fill(0);
  products.forEach((p) => {
    const month = new Date(p.createdAt).getMonth();
    monthlySales[month]++;
  });

  // Weekly revenue stats
  const revenueStats = Array(4).fill(0);
  const now = new Date();
  orders.forEach((order) => {
    const diffInWeeks = Math.floor(
      (now - new Date(order.createdAt)) / (7 * 24 * 60 * 60 * 1000)
    );
    if (diffInWeeks >= 0 && diffInWeeks < 4) {
      revenueStats[3 - diffInWeeks] += order.totalAmount || 0;
    }
  });

  const statusCounts = {
    delivered: orders.filter((o) => o.status === "Delivered").length,
    pending: orders.filter((o) => o.status === "Pending").length,
    canceled: orders.filter((o) => o.status === "Canceled").length,
  };

  // Target logic
  const target = 20000000;

  // Revenue this month
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const revenueThisMonth = orders
    .filter((o) => {
      const date = new Date(o.createdAt);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    })
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Revenue today
  const revenueToday = orders
    .filter((o) => new Date(o.createdAt).toDateString() === now.toDateString())
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const percentAchieved = (revenueToday / target) * 100;

  // Date ranges for change %
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - 7);

  const startOfLastWeek = new Date(now);
  startOfLastWeek.setDate(now.getDate() - 14);

  // Customers change %
  const usersThisWeek = await User.countDocuments({
    createdAt: { $gte: startOfThisWeek },
  });
  const usersLastWeek = await User.countDocuments({
    createdAt: { $gte: startOfLastWeek, $lt: startOfThisWeek },
  });
  const customerChangePercent =
    usersLastWeek === 0
      ? usersThisWeek > 0
        ? 100
        : 0
      : ((usersThisWeek - usersLastWeek) / usersLastWeek) * 100;

  // Orders change %
  const ordersThisWeek = await Order.countDocuments({
    createdAt: { $gte: startOfThisWeek },
  });
  const ordersLastWeek = await Order.countDocuments({
    createdAt: { $gte: startOfLastWeek, $lt: startOfThisWeek },
  });
  const orderChangePercent =
    ordersLastWeek === 0
      ? ordersThisWeek > 0
        ? 100
        : 0
      : ((ordersThisWeek - ordersLastWeek) / ordersLastWeek) * 100;

  // Earnings change %
  const earningsThisWeekAgg = await Order.aggregate([
    {
      $match: {
        paymentStatus: "Paid",
        createdAt: { $gte: startOfThisWeek },
      },
    },
    { $group: { _id: null, total: { $sum: "$totals.grandTotal" } } },
  ]);
  const earningsLastWeekAgg = await Order.aggregate([
    {
      $match: {
        paymentStatus: "Paid",
        createdAt: { $gte: startOfLastWeek, $lt: startOfThisWeek },
      },
    },
    { $group: { _id: null, total: { $sum: "$totals.grandTotal" } } },
  ]);
  const earningsThisWeek = earningsThisWeekAgg[0]?.total || 0;
  const earningsLastWeek = earningsLastWeekAgg[0]?.total || 0;
  const earningsChangePercent =
    earningsLastWeek === 0
      ? earningsThisWeek > 0
        ? 100
        : 0
      : ((earningsThisWeek - earningsLastWeek) / earningsLastWeek) * 100;

  // Products change %
  const productsThisWeek = await Product.countDocuments({
    createdAt: { $gte: startOfThisWeek },
  });
  const productsLastWeek = await Product.countDocuments({
    createdAt: { $gte: startOfLastWeek, $lt: startOfThisWeek },
  });
  const productsChangePercent =
    productsLastWeek === 0
      ? productsThisWeek > 0
        ? 100
        : 0
      : ((productsThisWeek - productsLastWeek) / productsLastWeek) * 100;

  // Low stock change %
  const lowStockThreshold = 5;
  const lowStockThisWeek = await Product.countDocuments({
    stock: { $lte: lowStockThreshold },
    createdAt: { $gte: startOfThisWeek },
  });
  const lowStockLastWeek = await Product.countDocuments({
    stock: { $lte: lowStockThreshold },
    createdAt: { $gte: startOfLastWeek, $lt: startOfThisWeek },
  });
  const lowStockChangePercent =
    lowStockLastWeek === 0
      ? lowStockThisWeek > 0
        ? 100
        : 0
      : ((lowStockThisWeek - lowStockLastWeek) / lowStockLastWeek) * 100;

  // Total earnings overall
  const paidOrders = await Order.aggregate([
    { $match: { paymentStatus: "Paid" } },
    { $group: { _id: null, total: { $sum: "$totals.grandTotal" } } },
  ]);
  const totalEarnings = paidOrders[0]?.total || 0;

  res.json({
    customers: totalUsers,
    orders: totalOrders,
    customerChangePercent: Math.round(customerChangePercent),
    orderChangePercent: Math.round(orderChangePercent),
    earningsChangePercent: Math.round(earningsChangePercent),
    productsChangePercent: Math.round(productsChangePercent),
    lowStockChangePercent: Math.round(lowStockChangePercent),
    totalEarnings,
    totalProductsInStock: await Product.countDocuments({ stock: { $gt: 0 } }),
    lowStockProducts: await Product.countDocuments({
      stock: { $lte: lowStockThreshold },
    }),
    monthlySales,
    revenueStats,
    recentOrders: orders.slice(-5).reverse(),
    orderStatusCounts: statusCounts,
    targetStats: {
      target,
      revenue: revenueToday,
      revenueThisMonth,
      percentAchieved,
      differencePercent: 10,
    },
  });
});
