import express from "express";
import Subscriber from "../models/Subscriber.js";
import crypto from "crypto";
import { getTransporter } from "../config/mail.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    let subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      subscriber = await Subscriber.create({
        email,
        token,
        verified: false,
      });
    } else {
      subscriber.token = token;
      subscriber.verified = false;
      await subscriber.save();
    }

    const transporter = getTransporter();

   const verifyLink = `${process.env.API_URL}/api/subscribe/verify/${token}`;

await transporter.sendMail({
  from: `"Brandnatic" <${process.env.MAIL_USER}>`,
  to: email,
  subject: "Verify your email",
  html: `
    <h2>Email Verification</h2>
    <p>Comment karne ke liye email verify karo</p>
    <a href="${verifyLink}" target="_blank">
      Verify Email
    </a>
  `,
});

res.json({ message: "Verification email sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Subscribe failed" });
  }
});



// router.get("/verify/:token", async (req, res) => {
//   try {
//     const { token } = req.params;

//     // 🔥 FIX: token field match
//     const subscriber = await Subscriber.findOne({
//       verifyToken: token,
//     });

//     if (!subscriber) {
//       return res.send("❌ Galat ya expired link");
//     }

//     subscriber.verified = true;
//     subscriber.verifyToken = null;
//     await subscriber.save();

//     // 🔥 AUTO REDIRECT (frontend)
//     res.send(`
//       <html>
//         <body style="font-family: Arial; text-align: center; padding-top: 50px;">
//           <h2>Email verify ho gaya ✅</h2>
//           <p>Ab aap comment kar sakte ho.</p>
//           <p>Redirect ho raha hai...</p>

//           <script>
//             setTimeout(() => {
//               window.location.href = "http://localhost:5173";
//             }, 2000);
//           </script>
//         </body>
//       </html>
//     `);
//   } catch (err) {
//     res.send("Verification fail ho gaya");
//   }
// });

router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // 1️⃣ Find by token
    const subscriber = await Subscriber.findOne({ token });

    // 2️⃣ Agar token mila → verify karo
    if (subscriber) {
      subscriber.verified = true;
      subscriber.token = null;
      await subscriber.save();

      return res.redirect(
  `${process.env.CLIENT_URL}/verified?status=success`
);
    }

    // 3️⃣ Token nahi mila → check already verified user
    const alreadyVerified = await Subscriber.findOne({
      verified: true,
    });

   if (alreadyVerified) {
  return res.redirect(`${process.env.CLIENT_URL}/verified?status=already`);
}


    // 4️⃣ Actual invalid case
   return res.redirect(
  `${process.env.CLIENT_URL}/verified?status=invalid`
);

  } catch (err) {
    console.error(err);
    return res.redirect(
  `${process.env.CLIENT_URL}/verified?status=error`
);
  }
});


router.get("/status", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ verified: false });
  }

  const subscriber = await Subscriber.findOne({
    email: email.toLowerCase(),
  });

  return res.json({
    verified: !!subscriber?.verified,
  });
});


export default router;