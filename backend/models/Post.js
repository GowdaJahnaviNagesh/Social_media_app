const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  content: String,
  image: { type: String }, // 📷 Image field
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      text: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
});

module.exports = mongoose.model("Post", postSchema);
