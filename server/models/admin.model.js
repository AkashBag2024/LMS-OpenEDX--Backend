import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      // A simple regex for email validation
      match: [/\S+@\S+\.\S+/, "Email is invalid"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next(error);
  }
});

adminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = function () {
  const payload = {
    _id: this._id,
    role: "admin",
  };

  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;

  if (!accessTokenSecret || !accessTokenExpiry) {
    throw new Error(
      "ACCESS_TOKEN_SECRET or ACCESS_TOKEN_EXPIRY is not defined in .env file"
    );
  }

  return jwt.sign(payload, accessTokenSecret, {
    expiresIn: accessTokenExpiry,
  });
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
