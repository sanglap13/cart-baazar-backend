import { TInvalidateCacheProps } from "../../@types/service.types.js";
import { myCache } from "../../app.js";
import OrderModel from "../../models/order.model.js";
import ProductModel from "../../models/product.model.js";

export const invalidateCache = async ({
  product,
  order,
  admin,
  review,
  userId,
  orderId,
  productId,
}: TInvalidateCacheProps) => {
  //   if (review) {
  //     await redis.del([`reviews-${productId}`]);
  //   }

  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "all-products",
      `product-${productId}`,
    ];

    if (typeof productId === "string") productKeys.push(`product-${productId}`);

    if (typeof productId === "object")
      productId.forEach((i) => productKeys.push(`product-${i}`));

    await myCache.del(productKeys);
    // await redis.del(productKeys);
  }

  if (order) {
    const ordersKeys: string[] = [
      "all-orders",
      `my-orders-${userId}`,
      `order-${orderId}`,
    ];

    await myCache.del(ordersKeys);

    //     await redis.del(ordersKeys);
  }
  //   if (admin) {
  //     await redis.del([
  //       "admin-stats",
  //       "admin-pie-charts",
  //       "admin-bar-charts",
  //       "admin-line-charts",
  //     ]);
  //   }
};
