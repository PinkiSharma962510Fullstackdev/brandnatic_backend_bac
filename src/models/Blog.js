import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);
const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    text: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "spam"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);


const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    contentHTML: { type: String, required: true },
    coverImage: String,

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    faqs: [faqSchema],        // ADD
    comments: [commentSchema],//  ADD

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);


export default mongoose.model("Blog", blogSchema);
