import Comment from "../models/comment.js";
import User from "../models/users.js";

//create a new comment

export const createComment = async (req, res) => {
  const user = req.user;
  try {
    // Create a new comment
    const newComment = new Comment({
      user,
      mentor: req.body.mentor,
      rating: req.body.values.rating,
      comment: req.body.values.comment,
    });

    // Save the comment
    await newComment.save();

    // Update the mentor's rating
    const mentorId = req.body.mentor;
    const comments = await Comment.find({ mentor: mentorId });
    const averageRating = comments.length
      ? (
          comments.reduce((sum, comment) => sum + comment.rating, 0) /
          comments.length
        ).toFixed(2)
      : "0.00";

    // Update the mentor's rating in the User model
    await User.findByIdAndUpdate(mentorId, { rate: parseFloat(averageRating) });

    // Respond with the created comment
    res.status(200).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
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
