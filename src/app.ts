import express from "express";
import { connectDB } from "./utils/db/db.js";
import { errorMiddleware } from "./middlewares/errorHandler.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";

// Importing Routes";
import Routes from "./routes/index.routes.js";

config({
  path: "./.env",
});

const port = process.env.PORT || 4000;

//db connection
const mongoURI = process.env.MONGO_URI!;
connectDB(mongoURI);

export const myCache = new NodeCache();

const app = express();

//middlewares
app.use(express.json());
app.use(morgan("dev"));

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
