import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    mentorship_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentorship",
    },
    mentor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    mentee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isAgree: {
      type: Boolean,
      default: false,
    },
    agreementStatement: {
      // Fixed typo here
      type: String,
    },
  },
  { timestamps: true }
);

const Contract = mongoose.model("Contract", contractSchema);
export default Contract;
