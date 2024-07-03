import { TInvalidateCacheProps } from "../../@types/service.types.js";
import { myCache } from "../../app.js";
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
    ];

    const products = await ProductModel.find({}).select("_id");
    products.forEach((i) => productKeys.push(`product-${i._id}`));

    await myCache.del(productKeys);

    // if (typeof productId === "string") productKeys.push(`product-${productId}`);

    // if (typeof productId === "object")
    //   productId.forEach((i) => productKeys.push(`product-${i}`));

    // await redis.del(productKeys);
  }
  //   if (order) {
  //     const ordersKeys: string[] = [
  //       "all-orders",
  //       `my-orders-${userId}`,
  //       `order-${orderId}`,
  //     ];

  //     await redis.del(ordersKeys);
  //   }
  //   if (admin) {
  //     await redis.del([
  //       "admin-stats",
  //       "admin-pie-charts",
  //       "admin-bar-charts",
  //       "admin-line-charts",
  //     ]);
  //   }
};
