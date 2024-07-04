import express from "express";
import { adminOnlyAccess } from "../../middlewares/auth.js";
import {
  getBarCharts,
  getDashboardStats,
  getLineCharts,
  getPieCharts,
} from "../../controllers/dashboard/dashboard.controller.js";

const router = express.Router();

// route - /api/v1/dashboard/stats
router.get("/stats", adminOnlyAccess, getDashboardStats);

// route - /api/v1/dashboard/pie
router.get("/pie", adminOnlyAccess, getPieCharts);

// route - /api/v1/dashboard/bar
router.get("/bar", adminOnlyAccess, getBarCharts);

// route - /api/v1/dashboard/line
router.get("/line", adminOnlyAccess, getLineCharts);

export default router;
