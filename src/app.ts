import express from "express";
import { connectDB } from "./utils/db/db.js";
import { errorMiddleware } from "./middlewares/errorHandler.js";
import NodeCache from "node-cache";

// Importing Routes";
import Routes from "./routes/index.routes.js";

const port = 4000;

//db connection
connectDB("mongodb://localhost:27017");

export const myCache = new NodeCache();

const app = express();

//middlewares
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//Routes
app.use("/api/v1", Routes);

app.use("/uploads", express.static("uploads"));

//Error Handler
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
