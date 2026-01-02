import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import { hashPassword } from "../utils/hash.js";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await connectDB();

    const exists = await User.findOne({ role: "superadmin" });
    if (exists) {
      console.log(" SuperAdmin already exists");
      process.exit();
    }

    await User.create({
      name: "Super Admin",
      email: "admin@gmail.com",
      password: await hashPassword("admin123"),
      role: "superadmin",
      permissions: {
        blogs: { create: true, edit: true, delete: true, publish: true },
        comments: { approve: true, spam: true, delete: true },
        users: { manage: true },
      },
    });

    console.log(" SuperAdmin created successfully");
    process.exit();
  } catch (err) {
    console.error(" Error:", err.message);
    process.exit(1);
  }
};

createSuperAdmin();
