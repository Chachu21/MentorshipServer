import FeedBack from "../models/feedback.js";

//create a new comment

export const createFeedBack = async (req, res) => {
  console.log(req.body);
  const newComment = new FeedBack({
    name: req.body.name,
    email: req.body.email,
    rating: req.body.rating,
    comment: req.body.comment,
  });
  newComment.save();
  res.status(200).json(newComment);
};

// Get all comments
export const getFeedBack = async (req, res) => {
  const comments = await FeedBack.find();
  res.status(200).json(comments);
};

// Get single comment by ID
export const getFeedBackById = async (req, res) => {
  const { id } = req.params; // Extract comment ID from request parameters

  try {
    const comment = await FeedBack.findById(id); // Use findById to find by ID
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Comment" });
  }
};
//Delete comments
export const deleteFeedBack = async (req, res) => {
  const { id } = req.params; // Extract comment ID from request parameters

  try {
    const comment = await FeedBack.findByIdAndDelete(id); // Use findById to find by ID
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete Comment" });
  }
};
