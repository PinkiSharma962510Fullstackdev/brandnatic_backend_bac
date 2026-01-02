import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const router = express.Router();

router.post("/", protect, checkPermission("users.manage"), createUser);
router.get("/", protect, checkPermission("users.manage"), getAllUsers);
router.get("/:id", protect, checkPermission("users.manage"), getUserById);
router.put("/:id", protect, checkPermission("users.manage"), updateUser);
router.delete("/:id", protect, checkPermission("users.manage"), deleteUser);

export default router;
