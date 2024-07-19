import mongoose from "mongoose";

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
    YourPayment: { type: Number },
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
  },
  { timestamps: true }
);

const Mentorship = mongoose.model("Mentorship", mentorshipSchema);
export default Mentorship;
