 import mongoose from "mongoose";

// const attendanceSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   meetingId: {
//     type: String,
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ["present", "absent"],
//     default: "present",
//   },
//   date: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Attendance = mongoose.model("Attendance", attendanceSchema);

// export default Attendance;


//manually


const attendanceSchema = new mongoose.Schema({
   appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
