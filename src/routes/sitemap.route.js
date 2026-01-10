import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const blogs = await Blog.find(
      { status: "published" },
      { slug: 1, updatedAt: 1 }
    ).sort({ updatedAt: -1 });

    res.setHeader("Content-Type", "application/xml");

    const baseUrl = "https://www.brandnatic.com";

    const urls = blogs
      .map(
        (blog) => `
  <url>
    <loc>${baseUrl}/blogs/${blog.slug}</loc>
    <lastmod>${new Date(blog.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  ${urls}

</urlset>`;

    res.send(sitemap);
  } catch (err) {
    console.error("SITEMAP ERROR:", err);
    res.status(500).send("Sitemap error");
  }
});

export default router;
