// import express from "express";
// import cors from "cors";
// import rateLimit from "express-rate-limit";

// import authRoutes from "./routes/auth.routes.js";
// import blogRoutes from "./routes/blog.routes.js";
// import commentRoutes from "./routes/comment.routes.js";
// import userRoutes from "./routes/user.routes.js";
// import enquiryRoutes from "./routes/enquiry.routes.js";

// const app = express();

// // ================= MIDDLEWARES =================
// app.use(cors());
// app.use(express.json());

// // ================= RATE LIMIT (ENQUIRY ONLY) =================
// const enquiryLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 minutes
//   max: 2, // max 3 requests per IP
//   message: {
//     message: "Too many enquiries. Please try again later.",
//   },
// });

// // ================= ROUTES ======================
// app.use("/api/auth", authRoutes);
// app.use("/api/blogs", blogRoutes);
// app.use("/api/comments", commentRoutes);
// app.use("/api/users", userRoutes);

// // ✅ LIMITER + ROUTE BOTH
// app.use("/api/enquiry", enquiryLimiter, enquiryRoutes);

// // ================= TEST ROUTE ==================
// app.get("/", (req, res) => {
//   res.send("API running successfully 🚀");
// });

// export default app;




import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import adminCommentRoutes from "./routes/comment.routes.js";
import publicCommentRoutes from "./routes/comment.public.routes.js";
import userRoutes from "./routes/user.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import subscribeRoutes from "./routes/subscribe.routes.js"; 

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ================= RATE LIMIT (ENQUIRY ONLY) =================
const enquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 2,
  message: { message: "Too many enquiries. Please try again later." },
});

// ================= ROUTES =================

// AUTH / ADMIN
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// BLOGS
app.use("/api/blogs", blogRoutes);

// ✅ PUBLIC COMMENTS (WEBSITE)
app.use("/api/comments", publicCommentRoutes);

// ✅ ADMIN COMMENTS (DASHBOARD)
app.use("/api/admin/comments", adminCommentRoutes);

// ENQUIRY
app.use("/api/enquiry", enquiryLimiter, enquiryRoutes);

app.use("/api/subscribe", subscribeRoutes);

app.get("/", (req, res) => {
  res.send("API running successfully 🚀");
});

export default app;
