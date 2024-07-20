import mongoose from "mongoose";

// Create a schema for comments
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    mentor: {
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

// Create a model for comments
const Comment = mongoose.model("Comment", commentSchema);

// // Post-save hook to update mentor rating
// commentSchema.post("save", async function (doc) {
//   try {
//     // Get the mentor's ID from the saved comment
//     const mentorId = doc.mentor;

//     // Fetch all comments for this mentor
//     const comments = await Comment.find({ mentor: mentorId });
//     console.log(comments);
//     // Calculate the new average rating
//     const averageRating = comments.length
//       ? comments.reduce((sum, comment) => sum + comment.rating, 0) /
//         comments.length
//       : 0;
//     console.log(averageRating);
//     // Update the mentor's rating
//     await User.findByIdAndUpdate(mentorId, { rate: averageRating });
//   } catch (error) {
//     console.error("Error updating mentor rating:", error);
//   }
// });

export default Comment;
