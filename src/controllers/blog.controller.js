import Blog from "../models/Blog.js";
import slugify from "slugify";

/* =========================
   CREATE BLOG
========================= */
console.log("🔥🔥 NEW CREATE BLOG CODE LOADED 🔥🔥");



export const createBlog = async (req, res) => {
  const {
    title,
    contentHTML,
    coverImage,
    status,
    faqs,
    seoTitle,
    seoDescription,
    slug: customSlug, // 👈 ADMIN PROVIDED SLUG
  } = req.body;

  /* ================= BASIC VALIDATION ================= */
  if (!title || !contentHTML) {
    return res.status(400).json({
      message: "Title & content required",
    });
  }

  /* ================= SLUG LOGIC (WP STYLE) ================= */
  const baseSlug = customSlug
    ? slugify(customSlug, { lower: true, strict: true })
    : slugify(title, { lower: true, strict: true });

  let slug = baseSlug;
  let attempt = 0;

  /* ================= CREATE WITH DUPLICATE SAFE ================= */
  while (true) {
    try {
      const blog = await Blog.create({
        title,
        slug,
        contentHTML,
        coverImage,

        /* ✅ SEO AUTO FALLBACK */
        seoTitle: seoTitle || title,
        seoDescription:
          seoDescription ||
          contentHTML.replace(/<[^>]*>/g, "").slice(0, 155),

        status: status || "draft",
        faqs: Array.isArray(faqs) ? faqs : [],
      });

      return res.status(201).json(blog);
    } catch (err) {
      /* 🔥 ONLY handle duplicate slug */
      if (err.code === 11000 && err.keyPattern?.slug) {
        attempt++;
        slug = `${baseSlug}-${attempt}`;
      } else {
        console.error("CREATE BLOG ERROR:", err);
        return res.status(500).json({
          message: err.message,
        });
      }
    }
  }
};









/* =========================
   GET ALL BLOGS (ADMIN)
========================= */
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET SINGLE BLOG
========================= */
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   UPDATE BLOG
========================= */
// export const updateBlog = async (req, res) => {
//   try {
//     const blog = await Blog.findById(req.params.id);

//     if (!blog) {
//       return res.status(404).json({ message: "Blog not found" });
//     }

//     blog.title = req.body.title || blog.title;
//     blog.contentHTML = req.body.contentHTML || blog.contentHTML;
//     blog.coverImage = req.body.coverImage || blog.coverImage;
//     blog.status = req.body.status || blog.status;

//     // ✅ ADD FAQs UPDATE (SAFE)
//     if (Array.isArray(req.body.faqs)) {
//       blog.faqs = req.body.faqs;
//     }

//     if (req.body.title && req.body.title !== blog.title) {
//   blog.slug =
//     slugify(req.body.title, { lower: true, strict: true }) +
//     "-" +
//     Date.now();
// }


//     await blog.save();
//     res.json(blog);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// export const updateBlog = async (req, res) => {
//   try {
//     const blog = await Blog.findById(req.params.id);

//     if (!blog) {
//       return res.status(404).json({ message: "Blog not found" });
//     }

//     blog.title = req.body.title || blog.title;
//     blog.contentHTML = req.body.contentHTML || blog.contentHTML;
//     blog.coverImage = req.body.coverImage || blog.coverImage;
//     blog.status = req.body.status || blog.status;

//     if (Array.isArray(req.body.faqs)) {
//       blog.faqs = req.body.faqs;
//     }

//     // ✅ slug untouched (SEO + no duplicate issues)

//     await blog.save();
//     res.json(blog);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

import Blog from "../models/Blog.js";

export const updateBlog = async (req, res) => {
  try {
    const {
      title,
      contentHTML,
      coverImage,
      status,
      faqs,
      seoTitle,
      seoDescription,
      slug: customSlug,
    } = req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // ❌ basic validation
    if (!title || !contentHTML) {
      return res.status(400).json({ message: "Title & content required" });
    }

    // ✅ SLUG LOGIC (WordPress style)
    const baseSlug = customSlug
      ? slugify(customSlug, { lower: true, strict: true })
      : slugify(title, { lower: true, strict: true });

    let finalSlug = baseSlug;
    let attempt = 0;

    // 🔁 duplicate slug protection
    while (true) {
      const exists = await Blog.findOne({
        slug: finalSlug,
        _id: { $ne: blog._id },
      });

      if (!exists) break;

      attempt++;
      finalSlug = `${baseSlug}-${attempt}`;
    }

    // ✅ UPDATE FIELDS
    blog.title = title;
    blog.slug = finalSlug;
    blog.contentHTML = contentHTML;
    blog.coverImage = coverImage || blog.coverImage;
    blog.status = status || blog.status;

    blog.seoTitle = seoTitle || title;
    blog.seoDescription =
      seoDescription ||
      contentHTML.replace(/<[^>]*>/g, "").slice(0, 155);

    if (Array.isArray(faqs)) {
      blog.faqs = faqs;
    }

    await blog.save();

    res.json(blog);
  } catch (err) {
    console.error("UPDATE BLOG ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


/* =========================
   PUBLISH / UNPUBLISH
========================= */
export const togglePublish = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.status = blog.status === "published" ? "draft" : "published";
    await blog.save();

    res.json({ message: "Status updated", status: blog.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   DELETE BLOG
========================= */
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET PUBLISHED BLOGS (PUBLIC)
========================= */
export const getPublicBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "published" })
      .sort({ createdAt: -1 })
      .select("title slug contentHTML coverImage createdAt");

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET SINGLE BLOG (PUBLIC)
========================= */
export const getSinglePublicBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      status: "published",
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

