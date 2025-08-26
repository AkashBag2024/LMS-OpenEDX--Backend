import Admin from "../models/admin.model.js";
import expressAsyncHandler from "express-async-handler";

/**
 * @description Register a new admin
 * @route POST /api/admin/register
 * @access Public
 */

const registerAdmin = expressAsyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    const newAdmin = new Admin({
      email,
      password,
    });

    const savedAdmin = await newAdmin.save();

    const adminToReturn = {
      _id: savedAdmin._id,
      email: savedAdmin.email,
      createdAt: savedAdmin.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: adminToReturn,
    });
  } catch (error) {
    console.error("Error in registerAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
      error: error.message,
    });
  }
});

/**
 * @description Log in an existing admin
 * @route POST /api/admin/login
 * @access Public
 */

const loginAdmin = expressAsyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await admin.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const accessToken = admin.generateAccessToken();

    const loggedInAdmin = {
      _id: admin._id,
      email: admin.email,
    };

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      data: {
        admin: loggedInAdmin,
        accessToken,
      },
    });
  } catch (error) {
    console.error("Error in loginAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
      error: error.message,
    });
  }
});

export default adminController = {
  registerAdmin,
  loginAdmin,
};
