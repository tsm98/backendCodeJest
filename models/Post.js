const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  description: String,
  tags: [String],
  file: String,
  user: {},
  likes: [String],
  comment: [
    {
      user: {
        type: {},
      },
      text: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
      avatar: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      likes: {
        type: Number,
      },
    },
  ],
});

const Post = mongoose.model("posts", postSchema);
module.exports = Post;
