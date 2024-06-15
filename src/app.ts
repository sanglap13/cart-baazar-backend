import express from "express";

// Importing Routes";
import Routes from "./routes/index.routes.js";

const port = 4000;

const app = express();

//Routes
app.use("/api/v1", Routes);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
