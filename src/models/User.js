import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  blogs: {
    create: Boolean,
    edit: Boolean,
    delete: Boolean,
    publish: Boolean,
  },
  comments: {
    approve: Boolean,
    spam: Boolean,
    delete: Boolean,
  },
  users: {
    manage: Boolean,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["superadmin", "admin", "editor", "moderator"],
      default: "editor",
    },
    permissions: permissionSchema,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
