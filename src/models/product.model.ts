import mongoose, { model } from "mongoose";
import { ProductSchema } from "./schemas/product.schema.js";
import exp from "constants";

const ProductModel = model("Product", ProductSchema);

export default ProductModel;
