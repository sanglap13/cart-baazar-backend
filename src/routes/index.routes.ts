import express from "express";

import UserRoutes from "./user/user.routes.js";

const app = express();

app.use("/user", UserRoutes);

export default app;
