import mongoose from "mongoose";
const proposalSchema = new mongoose.Schema({
  title: {
    type: string,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Proposal = mongoose.model("Proposal", proposalSchema);

export default Proposal;
