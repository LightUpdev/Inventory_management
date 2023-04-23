import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// GENERATE TOKEN FOR USER
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// REGISTER USER CODE
const registerUser = asyncHandler(async (req, res) => {
  const { name, photo, bio, email, phone_number, password } = req.body;

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //   VALIDATION
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //   CHECK IF USER EMAIL ALREADY EXIST
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("Email already exists");
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //CREATE NEW USER
  const user = await User.create({
    name,
    photo,
    bio,
    email,
    phone_number,
    password,
  });

  //CREATE TOKEN
  const token = generateToken(user._id);

  //SEND HTTP-ONLY COOKIE
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 24 * 60 * 60),
    sameSite: "none",
    secure: true,
  });

  // GET RESPONSE IF USER CREATION IS SUCCESSFUL
  if (user) {
    const { _id, name, photo, bio, email, phone_number, password } = user;
    res
      .status(201)
      .json({ _id, name, photo, bio, email, password, phone_number, token });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LOGIN USER CODE
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //   VALIDATION
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and Password are required");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }
  // CHECK IF USER EXIST
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User not found, Please sign up ");
  }

  //CREATE TOKEN
  const token = generateToken(user._id);

  //SEND HTTP-ONLY COOKIE
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 24 * 60 * 60),
    sameSite: "none",
    secure: true,
  });

  //IF USER EXIST, CHECK PASSWORD
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (user && isPasswordCorrect) {
    const { _id, name, photo, bio, email, phone_number, password } = user;
    res
      .status(200)
      .json({ _id, name, photo, bio, email, password, phone_number, token });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

// LOG OUT USER
const logoutUser = asyncHandler(async (req, res) => {
  //DELETE COOKIE
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ message: "User logged out successfully" });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { _id, name, photo, bio, email, phone_number } = user;
    res.status(200).json({ _id, name, photo, bio, email, phone_number, token });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

export { registerUser, loginUser, logoutUser, getUser };
