import { Request } from "express";
import { TryCatchWrapper } from "../../middlewares/errorHandler.js";
import ErrorHandler from "../../utils/services/errorHandler.js";
import { invalidateCache } from "../../utils/services/invalidateCache.js";
import { INewOrderRequestBody } from "../../@types/interfaces/order.interface.js";
import OrderModel from "../../models/order.model.js";
import { reduceStock } from "../../utils/services/reduceStock.js";
import { myCache } from "../../app.js";

export const myOrders = TryCatchWrapper(async (req, res, next) => {
  const { id: user } = req.query;

  const key = `my-orders-${user}`;

  let orders;

  if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
  else {
    orders = await OrderModel.find({ user });
    myCache.set(key, JSON.stringify(orders));
  }
  //   orders = await redis.get(key);

  //   if (orders) orders = JSON.parse(orders);
  //   else {
  //     orders = await OrderModel.find({ user });
  //     await redis.setex(key, redisTTL, JSON.stringify(orders));
  //   }
  return res.status(200).json({
    success: true,
    orders,
  });
});

export const allOrders = TryCatchWrapper(async (req, res, next) => {
  const key = `all-orders`;

  let orders;

  if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
  else {
    orders = await OrderModel.find().populate("user", "name");
    myCache.set(key, JSON.stringify(orders));
  }
  // orders = await redis.get(key);

  // if (orders) orders = JSON.parse(orders);
  // else {
  //   orders = await Order.find().populate("user", "name");
  //   await redis.setex(key, redisTTL, JSON.stringify(orders));
  // }
  return res.status(200).json({
    success: true,
    orders,
  });
});

export const getSingleOrder = TryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;
  const key = `order-${id}`;

  let order;

  if (myCache.has(key)) order = JSON.parse(myCache.get(key) as string);
  else {
    order = await OrderModel.findById(id).populate("user", "name");

    if (!order) return next(new ErrorHandler("Order Not Found", 404));

    myCache.set(key, JSON.stringify(order));
  }
  // order = await redis.get(key);

  // if (order) order = JSON.parse(order);
  // else {
  //   order = await Order.findById(id).populate("user", "name");

  //   if (!order) return next(new ErrorHandler("Order Not Found", 404));

  //   await redis.setex(key, redisTTL, JSON.stringify(order));
  // }
  return res.status(200).json({
    success: true,
    order,
  });
});

export const newOrder = TryCatchWrapper(
  async (req: Request<{}, {}, INewOrderRequestBody>, res, next) => {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
      return next(new ErrorHandler("Please Enter All Fields", 400));

    const order = await OrderModel.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    await reduceStock(orderItems);

    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: order.orderItems.map((i) => String(i.productId)),
    });

    return res.status(201).json({
      success: true,
      message: "Order Placed Successfully",
    });
  }
);

export const processOrder = TryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;

  const order = await OrderModel.findById(id);

  if (!order) return next(new ErrorHandler("Order Not Found", 404));

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
      break;
    default:
      order.status = "Delivered";
      break;
  }

  await order.save();

  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(200).json({
    success: true,
    message: "Order Processed Successfully",
  });
});

export const deleteOrder = TryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;

  const order = await OrderModel.findById(id);
  if (!order) return next(new ErrorHandler("Order Not Found", 404));

  await order.deleteOne();

  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(200).json({
    success: true,
    message: "Order Deleted Successfully",
  });
});
