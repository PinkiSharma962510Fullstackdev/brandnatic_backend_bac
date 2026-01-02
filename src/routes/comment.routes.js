import express from "express";
import {
  getPendingComments,
  getSpamComments,
  approveComment,
  moveToSpam,
  restoreFromSpam,
  deleteComment,
   countPendingComments,
  countSpamComments,
} from "../controllers/comment.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const router = express.Router();

router.get("/pending", protect, checkPermission("comments.approve"), getPendingComments);
router.get("/spam", protect, checkPermission("comments.spam"), getSpamComments);

router.put("/:id/approve", protect, checkPermission("comments.approve"), approveComment);
router.put("/:id/spam", protect, checkPermission("comments.spam"), moveToSpam);
router.put("/:id/restore", protect, checkPermission("comments.approve"), restoreFromSpam);

router.delete("/:id", protect, checkPermission("comments.delete"), deleteComment);
// router.get("/count/pending", protect, countPendingComments);
// router.get("/count/spam", protect, countSpamComments);

router.get("/count/pending", countPendingComments);
router.get("/count/spam", countSpamComments);


export default router;  
