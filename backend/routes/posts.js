const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const authMiddleware = require("../middleware/auth");
 // use this consistently
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Create post with optional image
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  const { content } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const post = new Post({
    content,
    user: req.user._id,
    image,
  });
  await post.save();
  res.status(201).json(post);
});

// Add a comment to a post
router.post("/comment/:id", authMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id);
  post.comments.push({ text: req.body.text, user: req.user._id });
  await post.save();
  res.json(post);
});

// Get all posts with user and comment user info
router.get("/", async (req, res) => {
  const posts = await Post.find()
    .populate("user", "username")
    .populate("comments.user", "username");
  res.json(posts);
});

// Like/unlike a post
router.put("/like/:id", authMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id);
  const userId = req.user._id;

  if (!post.likes.includes(userId)) post.likes.push(userId);
  else post.likes.pull(userId);

  await post.save();
  res.json(post);
});
router.delete("/:id", authMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  if (post.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  await post.deleteOne();
  res.json({ message: "Post deleted" });
});


module.exports = router;
