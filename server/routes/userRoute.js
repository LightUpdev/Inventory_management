import {
  loginUser,
  logoutUser,
  registerUser,
  getUser,
} from "../controllers/userController.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/get-user", protect, getUser);

export default router;
