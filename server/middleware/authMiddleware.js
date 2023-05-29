import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

export const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Unauthorized access to page, please login");
    }
    // VERIFY TOKEN
    const verify = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // GET USER ID FROM TOKEN
    const user = await User.findById(verify.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("user not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
});
