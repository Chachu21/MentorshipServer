import mongoose from "mongoose";

//create a schema for comments
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      required: true,
      min: 0, // Ensure positive rating
      max: 5,
      default: 0,
    },
    comment: {
      type: String,
      required: true,
      trim: true, // Remove leading/trailing whitespace
    },
  },
  { timestamps: true }
);

//create model for comments

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
