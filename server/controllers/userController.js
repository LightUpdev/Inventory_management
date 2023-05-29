import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Token } from "../models/resetTokenModel.js";
import crypto from "crypto";
import { sendEmail } from "../utils/emailSenderFunc.js";
import { response } from "express";

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
    res.status(200).json({ _id, name, photo, bio, email, phone_number });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

const getStatus = asyncHandler(async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    res.json(false);
  }
  if (token) {
    const verify = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (verify) {
      res.json(true);
    } else {
      res.json(false);
    }
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UPDATE USER ROUTE
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user) {
    const { name, email, password, photo, bio, phone_number } = user;
    user.email = email;
    user.password = password;
    user.name = req.body.name || name;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;
    user.phone_number = req.body.phone_number || phone_number;

    const updatedUser = await user.save();
    res.status(200).json({
      name: updatedUser.name,
      email: updatedUser.email,
      password: updatedUser.password,
      photo: updatedUser.photo,
      bio: updatedUser.bio,
      phone_number: updatedUser.phone_number,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DELETE USER ROUTE
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user) {
    await User.findByIdAndDelete(user._id);
    res.status(200).json({ message: "User deleted successfully" });
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const changePassword = asyncHandler(async (req, res) => {
  const { password, oldPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
  }
  if (!oldPassword || !password) {
    res.status(404);
    throw new Error("please provide old and new password!");
  }
  if (user) {
    const confirmPassword = await bcrypt.compare(oldPassword, user.password);
    if (!confirmPassword) {
      res.status(404);
      throw new Error("OLd password does not match!");
    }
    if (confirmPassword) {
      user.password = password;
      await user.save();
      res.status(200).json({ message: "Password changed successfully" });
    }
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User does not exist, please register!");
  }

  if (user) {
    // DELETE PREVIOUS USER RESET TOKEN
    const previousToken = await Token.findOne({ userId: user._id });
    if (previousToken) {
      await previousToken.deleteOne();
    }

    // CREATE RESET TOKEN
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    //  HASH TOKEN BEFORE SAVING TO DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // SAVE TOKEN TO DB
    const savedToken = await new Token({
      userId: user._id,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 60 * 1000, // expires in 30 minutes
    });
    savedToken.save();

    // CONSTRUCT RESET URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // CONSTRUCT EMAIL MESSAGE
    const message = `<h2>Hello ${user.name}</h2> 
    <p>You requested for a password reset</p>
    <p>Please use the url below to reset your password.</p>
    <p>This reset link is valid for only 30 minutes.</p>

    <p><a href=${resetUrl} clicktracking=off>${process.env.FRONTEND_URL}/reset-password/${resetToken}</a></p>

    <p>regards...</p>
    
    `;
    const subject = "Password Reset Request";
    const sent_from = process.env.EMAIL_USER;
    const send_to = user.email;

    try {
      await sendEmail(subject, message, send_to, sent_from);
      res
        .status(200)
        .json({ success: true, message: "Reset Email Sent", resetToken });
    } catch (error) {
      res.status(500);
      throw new Error("Email not sent, Please try again");
    }
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;
  if (!resetToken || !password) {
    res.status(404);
    throw new Error("No user found");
  }
  if (!confirmPassword || !password) {
    res.status(404);
    throw new Error("Please enter your Password and confirm password");
  }
  if (password !== confirmPassword) {
    response.status;
    throw new Error("password and confirm password do not match");
  }

  // HASH TOKEN ,THEN COMPARE WITH DB TOKEN
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // FIND TOKEN IN DB
  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });
  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  } else {
    // FIND USER
    const user = await User.findOne({ _id: userToken.userId });

    user.password = password;
    await user.save();
    res
      .status(200)
      .json({
        success: true,
        message: "password reset successful, please login",
      });
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  getStatus,
  updateUser,
  deleteUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
