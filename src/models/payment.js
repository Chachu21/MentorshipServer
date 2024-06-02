import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
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

  verified_at: {
    type: Date,
    required: true,
  },
  paymentResponse: {
    // Payment verification response
    status: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
    },
   
    // You can add more fields here like transaction ID, timestamps, etc.
  },
  // You can add more fields as needed
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
