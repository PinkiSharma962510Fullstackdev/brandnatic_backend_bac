// import app from "../src/app.js";
// import connectDB from "../src/config/db.js";

// // 🔥 SERVERLESS ENTRY
// await connectDB();

// export default app


import app from "../src/app.js";
import connectDB from "../src/config/db.js";

await connectDB();

/* 🔥 FORCE CORS HEADERS AT SERVERLESS ENTRY */
export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.brandnatic.com");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return app(req, res);
}
