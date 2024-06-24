import mongoose, { model } from "mongoose";
import { ProductSchema } from "./schemas/product.schema.js";

const ProductModel = model("Product", ProductSchema);

export default ProductModel;
