import { Router } from "express";
import adminController from "../controllers/admin.controller.js";

const router = Router();
// --- Public Routes ---

// @route   POST /api/v1/admin/register
// @desc    Register a new admin
// @access  Public
router.route("/register").post(adminController.registerAdmin);

// @route   POST /api/v1/admin/login
// @desc    Log in an existing admin
// @access  Public
router.route("/login").post(adminController.loginAdmin);

export default router;
