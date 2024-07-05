import express from "express";
import { connectDB } from "./utils/db/db.js";
import { errorMiddleware } from "./middlewares/errorHandler.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";

// Importing Routes";
import Routes from "./routes/index.routes.js";

config({
  path: "./.env",
});

const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI!;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

//db connection
connectDB(mongoURI);

export const stripe = new Stripe(stripeSecretKey);
export const myCache = new NodeCache();

const app = express();

//middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
// app.use(
//   cors({
//     origin: [process.env.CLIENT_URL!],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

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
