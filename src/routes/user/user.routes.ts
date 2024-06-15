import express from "express";
import { newUser } from "../../controllers/user/user.controller.js";

const router = express.Router();

// route - /api/v1/user/new
router.route("/new").post(newUser);

// // Route - /api/v1/user/all
// app.get("/all", adminOnly, getAllUsers);

// // Route - /api/v1/user/dynamicID
// app.route("/:id").get(getUser).delete(adminOnly, deleteUser);

export default router;
