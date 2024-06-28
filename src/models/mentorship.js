import mongoose from "mongoose";
const agreementSchema = new mongoose.Schema(
  {
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    termsAccepted: {
      type: Boolean,
      default: false,
      required: true,
    },
    signedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const mentorshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    skills: [{ type: String, required: true }],
    description: {
      type: String,
      required: true,
    },
    goal: { type: String, required: true },
    service: { type: String, required: true },
    amount: { type: Number, required: true },
    duration: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentorshipCatagory: {
      type: String,
    },
    mentees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    contracts: [agreementSchema],
  },
  { timestamps: true }
);

const Mentorship = mongoose.model("Mentorship", mentorshipSchema);
export default Mentorship;
