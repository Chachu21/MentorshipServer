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
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "completed"],
      default: "pending",
    },
    paid: {
      type: String,
      enum: ["No", "Yes"],
      default: "No",
    },
  },
  { timestamps: true }
);

// Pre-save middleware to update status and paid fields
contractSchema.pre("save", function (next) {
  if (this.isModified("isApproved") && this.isApproved) {
    this.status = "active";
  }
  if (
    this.isModified("paid") &&
    this.paid === "Yes" &&
    this.isApproved === "active"
  ) {
    this.status = "completed";
  }
  next();
});

const Contract = mongoose.model("Contract", contractSchema);
export default Contract;
