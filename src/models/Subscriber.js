import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },

    // 🔥 ADD THIS (VERY IMPORTANT)
    token: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subscriber", subscriberSchema);
