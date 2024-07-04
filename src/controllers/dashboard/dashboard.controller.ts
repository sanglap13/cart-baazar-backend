import { myCache } from "../../app.js";
import { TryCatchWrapper } from "../../middlewares/errorHandler.js";
import OrderModel from "../../models/order.model.js";
import ProductModel from "../../models/product.model.js";
import UserModel from "../../models/user.model.js";
import { calculatePercentage } from "../../utils/services/calculatePercentage.js";
import { getInventories } from "../../utils/services/getInventories.js";

export const getDashboardStats = TryCatchWrapper(async (req, res, next) => {
  let stats;

  const key = "admin-stats";

  //   stats = await redis.get(key);

  // if (stats) stats = JSON.parse(stats);
  if (myCache.has(key)) stats = JSON.parse(myCache.get(key) as string);
  else {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };

    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    };

    const thisMonthProductsPromise = ProductModel.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthProductsPromise = ProductModel.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthUsersPromise = UserModel.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthUsersPromise = UserModel.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthOrdersPromise = OrderModel.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthOrdersPromise = OrderModel.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const lastSixMonthOrdersPromise = OrderModel.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    });

    const latestTransactionsPromise = OrderModel.find({})
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    const [
      thisMonthProducts,
      thisMonthUsers,
      thisMonthOrders,
      lastMonthProducts,
      lastMonthUsers,
      lastMonthOrders,
      productsCount,
      usersCount,
      allOrders,
      lastSixMonthOrders,
      categories,
      femaleUsersCount,
      latestTransaction,
    ] = await Promise.all([
      thisMonthProductsPromise,
      thisMonthUsersPromise,
      thisMonthOrdersPromise,
      lastMonthProductsPromise,
      lastMonthUsersPromise,
      lastMonthOrdersPromise,
      ProductModel.countDocuments(),
      UserModel.countDocuments(),
      OrderModel.find({}).select("total"),
      lastSixMonthOrdersPromise,
      ProductModel.distinct("category"),
      UserModel.countDocuments({ gender: "female" }),
      latestTransactionsPromise,
    ]);

    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const lastMonthRevenue = lastMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const changePercent = {
      revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
      product: calculatePercentage(
        thisMonthProducts.length,
        lastMonthProducts.length
      ),
      user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
      order: calculatePercentage(
        thisMonthOrders.length,
        lastMonthOrders.length
      ),
    };

    const revenue = allOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const count = {
      revenue,
      product: productsCount,
      user: usersCount,
      order: allOrders.length,
    };

    const orderMonthCounts = new Array(6).fill(0);
    const orderMonthyRevenue = new Array(6).fill(0);

    lastSixMonthOrders.forEach((order) => {
      const creationDate = order.createdAt;
      const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

      if (monthDiff < 6) {
        orderMonthCounts[6 - monthDiff - 1] += 1;
        orderMonthyRevenue[6 - monthDiff - 1] += order.total;
      }
    });

    const categoryCount = await getInventories({
      categories,
      productsCount,
    });

    const userRatio = {
      male: usersCount - femaleUsersCount,
      female: femaleUsersCount,
    };

    const modifiedLatestTransaction = latestTransaction.map((i) => ({
      _id: i._id,
      discount: i.discount,
      amount: i.total,
      quantity: i.orderItems.length,
      status: i.status,
    }));

    stats = {
      categoryCount,
      changePercent,
      count,
      chart: {
        order: orderMonthCounts,
        revenue: orderMonthyRevenue,
      },
      userRatio,
      latestTransaction: modifiedLatestTransaction,
    };

    // await redis.setex(key, redisTTL, JSON.stringify(stats));
  }

  return res.status(200).json({
    success: true,
    stats,
  });
});

export const getPieCharts = TryCatchWrapper(async (req, res, next) => {
  let charts;
  const key = "admin-pie-charts";

  charts = await redis.get(key);

  if (charts) charts = JSON.parse(charts);
  else {
    const allOrderPromise = OrderModel.find({}).select([
      "total",
      "discount",
      "subtotal",
      "tax",
      "shippingCharges",
    ]);

    const [
      processingOrder,
      shippedOrder,
      deliveredOrder,
      categories,
      productsCount,
      outOfStock,
      allOrders,
      allUsers,
      adminUsers,
      customerUsers,
    ] = await Promise.all([
      OrderModel.countDocuments({ status: "Processing" }),
      OrderModel.countDocuments({ status: "Shipped" }),
      OrderModel.countDocuments({ status: "Delivered" }),
      ProductModel.distinct("category"),
      ProductModel.countDocuments(),
      ProductModel.countDocuments({ stock: 0 }),
      allOrderPromise,
      UserModel.find({}).select(["dob"]),
      UserModel.countDocuments({ role: "admin" }),
      UserModel.countDocuments({ role: "user" }),
    ]);

    const orderFullfillment = {
      processing: processingOrder,
      shipped: shippedOrder,
      delivered: deliveredOrder,
    };

    const productCategories = await getInventories({
      categories,
      productsCount,
    });

    const stockAvailablity = {
      inStock: productsCount - outOfStock,
      outOfStock,
    };

    const grossIncome = allOrders.reduce(
      (prev, order) => prev + (order.total || 0),
      0
    );

    const discount = allOrders.reduce(
      (prev, order) => prev + (order.discount || 0),
      0
    );

    const productionCost = allOrders.reduce(
      (prev, order) => prev + (order.shippingCharges || 0),
      0
    );

    const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);

    const marketingCost = Math.round(grossIncome * (30 / 100));

    const netMargin =
      grossIncome - discount - productionCost - burnt - marketingCost;

    const revenueDistribution = {
      netMargin,
      discount,
      productionCost,
      burnt,
      marketingCost,
    };

    const usersAgeGroup = {
      teen: allUsers.filter((i) => i.age < 20).length,
      adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
      old: allUsers.filter((i) => i.age >= 40).length,
    };

    const adminCustomer = {
      admin: adminUsers,
      customer: customerUsers,
    };

    charts = {
      orderFullfillment,
      productCategories,
      stockAvailablity,
      revenueDistribution,
      usersAgeGroup,
      adminCustomer,
    };

    await redis.setex(key, redisTTL, JSON.stringify(charts));
  }

  return res.status(200).json({
    success: true,
    charts,
  });
});

export const getBarCharts = TryCatchWrapper(async (req, res, next) => {
  let charts;
  const key = "admin-bar-charts";

  charts = await redis.get(key);

  if (charts) charts = JSON.parse(charts);
  else {
    const today = new Date();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const sixMonthProductPromise = ProductModel.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");

    const sixMonthUsersPromise = UserModel.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");

    const twelveMonthOrdersPromise = OrderModel.find({
      createdAt: {
        $gte: twelveMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");

    const [products, users, orders] = await Promise.all([
      sixMonthProductPromise,
      sixMonthUsersPromise,
      twelveMonthOrdersPromise,
    ]);

    const productCounts = getChartData({ length: 6, today, docArr: products });
    const usersCounts = getChartData({ length: 6, today, docArr: users });
    const ordersCounts = getChartData({ length: 12, today, docArr: orders });

    charts = {
      users: usersCounts,
      products: productCounts,
      orders: ordersCounts,
    };

    await redis.setex(key, redisTTL, JSON.stringify(charts));
  }

  return res.status(200).json({
    success: true,
    charts,
  });
});

export const getLineCharts = TryCatchWrapper(async (req, res, next) => {
  let charts;
  const key = "admin-line-charts";

  charts = await redis.get(key);

  if (charts) charts = JSON.parse(charts);
  else {
    const today = new Date();

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const baseQuery = {
      createdAt: {
        $gte: twelveMonthsAgo,
        $lte: today,
      },
    };

    const [products, users, orders] = await Promise.all([
      ProductModel.find(baseQuery).select("createdAt"),
      UserModel.find(baseQuery).select("createdAt"),
      OrderModel.find(baseQuery).select(["createdAt", "discount", "total"]),
    ]);

    const productCounts = getChartData({ length: 12, today, docArr: products });
    const usersCounts = getChartData({ length: 12, today, docArr: users });
    const discount = getChartData({
      length: 12,
      today,
      docArr: orders,
      property: "discount",
    });
    const revenue = getChartData({
      length: 12,
      today,
      docArr: orders,
      property: "total",
    });

    charts = {
      users: usersCounts,
      products: productCounts,
      discount,
      revenue,
    };

    await redis.setex(key, redisTTL, JSON.stringify(charts));
  }

  return res.status(200).json({
    success: true,
    charts,
  });
});
