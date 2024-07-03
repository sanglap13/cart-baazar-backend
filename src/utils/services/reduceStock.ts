import { TOrderItemType } from "../../@types/interfaces/order.interface.js";
import ProductModel from "../../models/product.model.js";

export const reduceStock = async (orderItems: TOrderItemType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await ProductModel.findById(order.productId);
    if (!product) throw new Error("Product Not Found");
    product.stock -= order.quantity;
    await product.save();
  }
};
