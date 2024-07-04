import mongoose from "mongoose";
import { CouponSchema } from "./schemas/coupon.schema.js";

export const CouponModel = mongoose.model("Coupon", CouponSchema);
