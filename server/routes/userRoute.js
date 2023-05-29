import {
  loginUser,
  logoutUser,
  registerUser,
  getUser,
  getStatus,
  updateUser,
  deleteUser,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/get-user", protect, getUser);
router.get("/get-status", getStatus);
// UPDATE USER
router.patch("/update-user", protect, updateUser);
router.patch("/change-password", protect, changePassword);
// UPDATE USER
router.delete("/delete-user", protect, deleteUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

export default router;
