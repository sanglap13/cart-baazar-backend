import mongoose from "mongoose";
import { OrderSchema } from "./schemas/order.schema.js";

const OrderModel = mongoose.model("Order", OrderSchema);

export default OrderModel;
