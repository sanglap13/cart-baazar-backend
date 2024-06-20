import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  newUser,
} from "../../controllers/user/user.controller.js";
import { adminOnlyAccess } from "../../middlewares/auth.js";

const router = express.Router();

// route - /api/v1/user/new
router.route("/new").post(newUser);

// Route - /api/v1/user/all
router.route("/all").get(adminOnlyAccess, getAllUsers);

// Route - /api/v1/user/dynamicID
router.route("/:id").get(getUser).delete(adminOnlyAccess, deleteUser);

export default router;
