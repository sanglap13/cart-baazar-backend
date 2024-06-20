import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  newUser,
} from "../../controllers/user/user.controller.js";

const router = express.Router();

// route - /api/v1/user/new
router.route("/new").post(newUser);

// Route - /api/v1/user/all
router.route("/all").get(getAllUsers);

// Route - /api/v1/user/dynamicID
router.route("/:id").get(getUser).delete(deleteUser);

export default router;
