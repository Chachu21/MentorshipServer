import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  menteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  

  endTime: { type: String, required: true },
  status: { type: String, default: "Confirmed" },
});


export default mongoose.model("Appointment", appointmentSchema);
