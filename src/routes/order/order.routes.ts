import express from "express";
import { adminOnlyAccess } from "../../middlewares/auth.js";
import { newOrder } from "../../controllers/order/order.controller.js";

const router = express.Router();

// route - /api/v1/order/new
router.post("/new", newOrder);

// route - /api/v1/order/my
// router.get("/my", myOrders);

// route - /api/v1/order/my
// router.get("/all", adminOnlyAccess, allOrders);

// router
//   .route("/:id")
//   .get(getSingleOrder)
//   .put(adminOnlyAccess, processOrder)
//   .delete(adminOnlyAccess, deleteOrder);

export default router;
