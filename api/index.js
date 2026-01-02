import app from "../src/app.js";
import connectDB from "../src/config/db.js";

// 🔥 SERVERLESS ENTRY
await connectDB();

export default app