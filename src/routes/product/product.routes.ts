import express from "express";

import { adminOnlyAccess } from "../../middlewares/auth.js";
import { newProduct } from "../../controllers/product/product.controller.js";
import { singleUpload } from "../../middlewares/multer.js";

const router = express.Router();

//To Create New Product  - /api/v1/product/new
router.post("/new", adminOnlyAccess, singleUpload, newProduct);

//To get all Products with filters  - /api/v1/product/all
// router.get("/all", getAllProducts);

//To get last 10 Products  - /api/v1/product/latest
// router.get("/latest", getlatestProducts);

//To get all unique Categories  - /api/v1/product/categories
// router.get("/categories", getAllCategories);

//To get all Products   - /api/v1/product/admin-products
// router.get("/admin-products", adminOnly, getAdminProducts);

// To get, update, delete Product
// router
//   .route("/:id")
//   .get(getSingleProduct)
//   .put(adminOnly, singleUpload, updateProduct)
//   .delete(adminOnly, deleteProduct);

export default router;
