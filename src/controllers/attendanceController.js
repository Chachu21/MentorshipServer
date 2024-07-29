// // Handle Zoom webhook events for attendance tracking
 
// export const createAttendance = async (req, res) => {
//   try {
//     const { event, payload } = req.body;

//     // Check if the event is participant joined or left
//     if (
//       event === "meeting.participant_joined" ||
//       event === "meeting.participant_left"
//     ) {
//       const { meetingId, participantId, status } = payload;

//       // Update or create attendance record based on participant's status
//       let attendance = await Attendance.findOne({
//         meetingId,
//         userId: participantId,
//       });

//       if (!attendance) {
//         // Create a new attendance record if it doesn't exist
//         attendance = await Attendance.create({
//           userId: participantId,
//           meetingId,
//           status: status === "joined" ? "present" : "absent",
//         });
//       } else {
//         // Update the existing attendance record
//         attendance.status = status === "joined" ? "present" : "absent";
//         await attendance.save();
//       }

//       res.status(200).json({ success: true, data: attendance });
//     } else {
//       res.status(400).json({ success: false, error: "Invalid event type" });
//     }
//   } catch (error) {
//     console.error("Error handling Zoom webhook:", error);
//     res
//       .status(500)
//       .json({ success: false, error: "Server error", details: error.message });
//   }
// };


//manually
// Get specific attendance record of each mentor
import Attendance from "../models/Attendances.js";
import User from "../models/users.js"; // Assuming you have a User model
export const createAttendance = async (req, res) => {
  
  try {
    const { appointment, mentor, mentee, status } = req.body;

    // Create a new attendance record
    const attendance = await Attendance.create({
      appointment,
      mentor,
      mentee,
      status,
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    console.error("Error creating attendance:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


// Get all attendance records
export const getAttendance = async (req, res) => {
  try {
    // Fetch all attendance records from the database
    const attendanceRecords = await Attendance.find();

    // Send the attendance records as a response
    res.status(200).json({ success: true, data: attendanceRecords });
  } catch (error) {
    // Handle errors
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};



export const getAttendanceByName = async (req, res) => {
  try {

    //
    const { fullName } = req.body;
    // console.log("Mentee name:", menteeName);

    // Find the user based on the mentee's name
 
   // const mentee = await User.findById(req.params.id);

    const mentee = await User.findOne({ fullName });
    // console.log("Mentee:", mentee);

    if (!mentee) {
      return res
        .status(404)
        .json({ success: false, error: "Mentee not found" });
    }

    // Query attendance records by mentee's user ID
    const attendance = await Attendance.find({ mentee: mentee._id });

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error", details: error.message });
  }
};

