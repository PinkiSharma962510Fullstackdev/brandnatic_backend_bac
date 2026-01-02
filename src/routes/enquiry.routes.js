import express from "express";
import { getTransporter } from "../config/mail.js";
import { getSheets } from "../config/googleSheet.js";

const router = express.Router();

/* ===== In-memory duplicate control (NO DB) ===== */
const recentEnquiries = new Map();
const DUPLICATE_WINDOW = 15 * 60 * 1000; // 15 minutes

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, website, service, message } = req.body;

    /* ========= BASIC REQUIRED VALIDATION ========= */
    if (!name || !email || !phone || !service || !message) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    /* ========= SOFT SANITY VALIDATION ========= */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    if (message.trim().length < 5) {
      return res.status(400).json({
        message: "Message is too short",
      });
    }

    /* ========= DUPLICATE SUBMISSION BLOCK ========= */
    const key = `${email}_${phone}_${service}`;
    const now = Date.now();

    if (recentEnquiries.has(key)) {
      const lastTime = recentEnquiries.get(key);
      if (now - lastTime < DUPLICATE_WINDOW) {
        return res.status(429).json({
          message: "You have already submitted an enquiry recently",
        });
      }
    }

    recentEnquiries.set(key, now);

    /* ========= GOOGLE SHEET (APPEND ONLY) ========= */
    const sheets = getSheets();

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Form Responses 1!A:G",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[
          new Date().toLocaleString(),
          name.trim(),
          email.trim(),
          phone.trim(),
          website?.trim() || "",
          service.trim(),
          message.trim(),
        ]],
      },
    });

    /* ========= EMAIL ========= */
    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"Website Enquiry" <${process.env.MAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Website Enquiry",
      html: `
        <h3>New Enquiry</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Website:</b> ${website || "-"}</p>
        <p><b>Service:</b> ${service}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("ENQUIRY ERROR:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
