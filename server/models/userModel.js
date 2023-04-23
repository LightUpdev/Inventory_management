import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Please add a name"] },
    photo: {
      type: String,
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    bio: {
      type: String,
      required: [true, "Bio must not be more than 250 characters"],
      default: "bio",
    },
    password: {
      type: String,
      required: [true, "Please add your password"],
      minLength: [6, "password must be up to 6 characters"],
      // maxLength: [50, "password must not be more than 23 characters"],
    },
    phone_number: {
      type: String,
      required: [true, "Please add your phone Number"],
      default: "+234",
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      ],
    },
  },
  { timestamps: true }
);

//ENCRYPT PASSWORD BEFORE SAVING TO DB
userSchema.pre("save", async function (next){
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(this.password, salt);
  this.password = hashPassword;
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
