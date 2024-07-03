import express from "express";

import UserRoutes from "./user/user.routes.js";
import ProductRoutes from "./product/product.routes.js";
import OrderRoutes from "./order/order.routes.js";

const app = express();

app.use("/user", UserRoutes);
app.use("/product", ProductRoutes);
app.use("/order", OrderRoutes);

export default app;
