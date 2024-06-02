import Comment from "../models/comment.js";

//create a new comment

export const createComment = async (req, res) => {
  const newComment = new Comment({
    fullName: req.body.fullName,
    email: req.body.email,
    rating: req.body.rating,
    comment: req.body.comment,
  });
  newComment.save();
  res.status(200).json(newComment);
};

// Get all comments
export const getComments = async (req, res) => {
  const comments = await Comment.find();
  res.status(200).json(comments);
};

// Get single comment by ID
export const getCommentById = async (req, res) => {
  const { id } = req.params; // Extract comment ID from request parameters

  try {
    const comment = await Comment.findById(id); // Use findById to find by ID
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Comment" });
  }
};
//Delete comments
export const deleteComment = async (req, res) => {
  const { id } = req.params; // Extract comment ID from request parameters

  try {
    const comment = await Comment.findByIdAndDelete(id); // Use findById to find by ID
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete Comment" });
  }
};
