import express from "express";
import { adminOnlyAccess } from "../../middlewares/auth.js";
import {
  allCoupons,
  applyDiscount,
  createPaymentIntent,
  deleteCoupon,
  getCoupon,
  newCoupon,
  updateCoupon,
} from "../../controllers/payment/payment.controller.js";

const router = express.Router();

// route - /api/v1/payment/create
router.post("/create", createPaymentIntent);

// route - /api/v1/payment/coupon/new
router.get("/discount", applyDiscount);

// route - /api/v1/payment/coupon/new
router.post("/coupon/new", adminOnlyAccess, newCoupon);

// route - /api/v1/payment/coupon/all
router.get("/coupon/all", adminOnlyAccess, allCoupons);

// route - /api/v1/payment/coupon/:id
router
  .route("/coupon/:id")
  .get(adminOnlyAccess, getCoupon)
  .put(adminOnlyAccess, updateCoupon)
  .delete(adminOnlyAccess, deleteCoupon);

export default router;
