import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    tx_ref: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    fullName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // mentorship: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Mentorship",
    //   required: true,
    // },
    // You can add more fields as needed
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
