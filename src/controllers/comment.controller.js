import Subscriber from "../models/Subscriber.js";
import Comment from "../models/Comment.js";
import mongoose from "mongoose";



export const addComment = async (req, res) => {
  try {
    const { blogId, name, email, comment } = req.body;

    /* ================= BASIC VALIDATION ================= */

    if (!blogId || !name || !email || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    if (comment.trim().length < 5) {
      return res.status(400).json({
        message: "Comment must be at least 5 characters",
      });
    }

    /* ================= SUBSCRIBER CHECK ================= */

    const subscriber = await Subscriber.findOne({
      email: email.toLowerCase(),
    });

    if (!subscriber || !subscriber.verified) {
      return res.status(403).json({
        code: "NOT_VERIFIED",
        message: "Please subscribe and verify your email",
      });
    }

    /* ================= 🔒 DAILY COMMENT LIMIT (2) ================= */

    const last24HoursCount = await Comment.countDocuments({
      blog: blogId,
      email: email.toLowerCase(),
      createdAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    });

    if (last24HoursCount >= 2) {
      return res.status(429).json({
        code: "COMMENT_LIMIT",
        message: "You can comment only 2 times on this blog in 24 hours",
      });
    }

    /* ================= SAVE COMMENT ================= */

    const newComment = await Comment.create({
      blog: blogId,
      name: name.trim(),
      email: email.toLowerCase(),
      comment: comment.trim(),
      status: "pending",
    });

    return res.status(201).json({
      message: "Comment submitted for review",
      comment: newComment,
    });

  } catch (error) {
    console.error("Add comment error:", error);
    return res.status(500).json({ message: "Failed to add comment" });
  }
};




/* ================= ADMIN COMMENT CONTROLS ================= */

// Pending comments
export const getPendingComments = async (req, res) => {
  try {
    const comments = await Comment.find({ status: "pending" })
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Spam comments
export const getSpamComments = async (req, res) => {
  try {
    const comments = await Comment.find({ status: "spam" })
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve comment
export const approveComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.status = "approved";
    await comment.save();

    res.json({ message: "Comment approved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Move to spam
export const moveToSpam = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.status = "spam";
    await comment.save();

    res.json({ message: "Comment moved to spam" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Restore from spam
export const restoreFromSpam = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.status = "pending";
    await comment.save();

    res.json({ message: "Comment restored to pending" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// COUNT PENDING COMMENTS
export const countPendingComments = async (req, res) => {
  const count = await Comment.countDocuments({ status: "pending" });
  res.json({ count });
};

// COUNT SPAM COMMENTS
export const countSpamComments = async (req, res) => {
  const count = await Comment.countDocuments({ status: "spam" });
  res.json({ count });
};




/* ================= PUBLIC: GET APPROVED COMMENTS ================= */

export const getApprovedCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    // BlogId validation
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({
        message: "Invalid blog ID",
      });
    }

    const comments = await Comment.find({
      blog: blogId,
      status: "approved",
    }).sort({ createdAt: -1 });

    return res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({
      message: "Failed to fetch comments",
    });
  }
};
