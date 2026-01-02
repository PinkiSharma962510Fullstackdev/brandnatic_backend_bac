import express from "express";
import {
  addComment,
  getApprovedCommentsByBlog,
} from "../controllers/comment.controller.js";

const router = express.Router();

/* ================= PUBLIC ================= */

router.post("/", addComment);               // POST /api/comments
router.get("/:blogId", getApprovedCommentsByBlog); // GET /api/comments/:blogId

export default router;
