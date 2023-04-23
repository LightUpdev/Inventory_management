import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

// GENERATE TOKEN FOR USER
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const registerUser = asyncHandler(async (req, res) => {
  const { name, photo, bio, email, phone_number, password } = req.body;

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //   VALIDATION
  if (!name || !email || !password) {
    res.status(404);
    throw new Error("Please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(404);
    throw new Error("Password must be at least 6 characters");
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //   CHECK IF USER EMAIL ALREADY EXIST
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(404);
    throw new Error("Email already exists");
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //CREATE NEW USER
  const newUser = await User.create({
    name,
    photo,
    bio,
    email,
    phone_number,
    password,
  });

  //CREATE TOKEN
  const token = generateToken(newUser._id);

  if (newUser) {
    const { _id, name, photo, bio, email, phone_number, password } = newUser;
    res
      .status(201)
      .json({ _id, name, photo, bio, email, password, phone_number, token });
  } else {
    res.status(404);
    throw new Error("Invalid user data");
  }
});

export { registerUser };
