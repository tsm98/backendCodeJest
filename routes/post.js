const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const User = require("../models/User");

//@route    POST api/posts
//@desc     Create a post
//@access   Private
router.post(
  "/",
  [[check("postTitle", "Text is missing").not().isEmpty()]],
  async (req, res) => {
    errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      console.log(req.body);
      const newPost = new Post({
        title: req.body.postTitle,
        description: req.body.postDescription,
        tags: req.body.postTags,
        file: req.body.file,
        userEmail: req.body.userEmail,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route    POST api/posts/getAllPosts
//@desc     get all posts
//@access   private

router.post("/getAllPosts", async (req, res) => {
  try {
    const posts = await Post.find();
    if (!posts.isEmpty) {
      console.log(posts);
      res.json(posts);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route    POST api/posts/getUserPosts
//@desc     get all posts by user
//@access   private

router.post("/getUserPosts", async (req, res) => {
  try {
    const userEmail = req.body.email;
    const posts = await Post.find({ userEmail });
    if (!posts.isEmpty) {
      console.log(posts);
      res.json(posts);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route    GET api/posts/:id
//@desc     GET post by id
//@access   Private

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
    }
    res.json({ post });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error or Invalid id");
  }
});

//@route    DELETE api/posts/:id
//@desc     Delete a post by id
//@access   Private

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).send("User not authorized");
    }
    if (!post) {
      return res.status(404).send("Post not found");
    }
    await post.remove();
    res.send("Post Deleted");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error or Invalid id");
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put("/like/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//@route    PUT api/posts/unlike/:id
//@desc     Unlike post
//@access   Private
router.put("/unlike/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Cant unlike post if not liked" });
    }
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error or Invalid id");
  }
});

//@route    POST api/posts/comment/:id
//@desc     Comment on post
//@access   Private
router.post(
  "/comment",
  [[check("text", "Text is missing").not().isEmpty()]],
  async (req, res) => {
    errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const email = req.body.user.email;
      let user = await User.findOne({ email });
      console.log(user);
      const post = await Post.findById(req.body.postId);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: user.id,
        likes: 0,
      };

      post.comment.unshift(newComment);

      await post.save();
      res.json(post.comment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route    DELETE api/posts/comment/:id/:comment_id
//@desc     Delete comment on post
//@access   Private

router.delete("/comment/:id/:comment_id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Get comment from post

    const comment = post.comment.find(
      (comment) => comment.id === req.params.comment_id
    );
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    //Check user
    if (req.user.id !== comment.user.toString()) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    const removeIndex = post.comment
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comment.splice(removeIndex, 1);
    await post.save();
    res.json(post.comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
