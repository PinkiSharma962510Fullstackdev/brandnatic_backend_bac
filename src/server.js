import dotenv from "dotenv";
dotenv.config(); // 🔥 bas itna hi

import app from "./app.js";
import connectDB from "./config/db.js";

// DEBUG (1 baar dekhne ke liye)
console.log("ENV CHECK:", {
  MONGO: process.env.MONGO_URI,
  CLIENT: process.env.GOOGLE_CLIENT_EMAIL,
  KEY_LEN: process.env.GOOGLE_PRIVATE_KEY?.length,
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
