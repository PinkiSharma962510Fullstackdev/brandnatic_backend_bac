import Blog from "../models/Blog.js";
import slugify from "slugify";

/* =========================
   CREATE BLOG
========================= */
export const createBlog = async (req, res) => {
  try {
    const { title, contentHTML, coverImage, status, faqs } = req.body;

    if (!title || !contentHTML) {
      return res.status(400).json({ message: "Title & content required" });
    }

    const slug = slugify(title, { lower: true, strict: true });

    const blog = await Blog.create({
      title,
      slug,
      contentHTML,
      coverImage,
      status: status || "draft",
      faqs: Array.isArray(faqs) ? faqs : [], // ✅ ADD ONLY THIS
      author: req.user._id,
    });

    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.title = req.body.title || blog.title;
    blog.contentHTML = req.body.contentHTML || blog.contentHTML;
    blog.coverImage = req.body.coverImage || blog.coverImage;
    blog.status = req.body.status || blog.status;

    // ✅ ADD FAQs UPDATE (SAFE)
    if (Array.isArray(req.body.faqs)) {
      blog.faqs = req.body.faqs;
    }

    if (req.body.title) {
      blog.slug = slugify(req.body.title, {
        lower: true,
        strict: true,
      });
    }

    await blog.save();
    res.json(blog);
  } catch (err) {
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

