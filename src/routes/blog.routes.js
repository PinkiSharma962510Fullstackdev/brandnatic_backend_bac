import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  togglePublish,
  deleteBlog,
  getPublicBlogs,
  getSinglePublicBlogBySlug,
} from "../controllers/blog.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const router = express.Router();

/* ================= PUBLIC ROUTES (NO AUTH) ================= */
// 🔓 ONLY READ-ONLY
router.get("/public", getPublicBlogs);
router.get("/public/:slug", getSinglePublicBlogBySlug);

/* ================= ADMIN ROUTES (AUTH REQUIRED) ================= */
router.post("/", protect, checkPermission("blogs.create"), createBlog);
router.get("/", protect, getAllBlogs);
router.get("/:id", protect, getBlogById);
router.put("/:id", protect, checkPermission("blogs.edit"), updateBlog);
router.put("/:id/publish", protect, checkPermission("blogs.publish"), togglePublish);
router.delete("/:id", protect, checkPermission("blogs.delete"), deleteBlog);

export default router;
