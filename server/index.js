import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoute from "./routes/userRoute.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

// PORT
const PORT = process.env.PORT || 5000;

// configure dotenv
dotenv.config();

// INITIALIZE EXPRESS
const app = express();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// MIDDLEWARE
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTE MIDDLEWARE
app.use("/api/users", userRoute);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HOME ROUTE
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Home Route",
  });
});

// ERROR MIDDLEWARE
app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });