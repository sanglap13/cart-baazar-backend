import express from "express";

// Importing Routes";
import Routes from "./routes/index.routes.js";
import { connectDB } from "./utils/db/db.js";
import { errorMiddleware } from "./middlewares/errorHandler.js";

const port = 4000;

//db connection
connectDB("mongodb://localhost:27017");

const app = express();

//middlewares
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//Routes
app.use("/api/v1", Routes);

//Error Handler
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
