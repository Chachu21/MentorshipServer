import axios from "axios";
import nodemailer from "nodemailer";
import Appointment from "../models/Appointment.js";

//email notifications
async function sendBookingConfirmation(
  //using this mentor id and mentee id we can get the respective mentor and mentee
  mentorId,
  menteeId,
  meetingLink,
  date,
  startTime
) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
      user: "mulukendemis44@gmail.com",
      pass: "jnko xwtx rcvd plgq", // Use your Gmail app password or account password
    },
  });
  // Convert the ISO 8601 date string to a Date object
  const meetingTime = new Date(meetingLink.meetingTime);

  // Format the date and time in a readable format
  const formattedMeetingTime = meetingTime.toLocaleString("en-US", {
    weekday: "long", // Full day of the week (e.g., Monday)
    year: "numeric", // 4-digit year (e.g., 2024)
    month: "long", // Full month name (e.g., January)
    day: "numeric", // Day of the month (e.g., 28)
    hour: "numeric", // Hour (e.g., 8 for 8 AM)
    minute: "numeric", // Minute (e.g., 48)
    timeZone: "UTC", // Timezone (e.g., Coordinated Universal Time)
  });

  // Now you can use formattedMeetingTime in your email text
  const mailOptions = {
    from: "mulukendemis44@gmail.com",
    to: ["amsaledemismuller@gmail.com", "amsalelij@gmail.com"],
    subject: "Mentorship Session Confirmation",
    text: `Your mentorship session has been scheduled for ${formattedMeetingTime}. 
    Join the meeting using this link: ${meetingLink.meeting_url}.
    Purpose: ${meetingLink.purpose}
    Duration: ${meetingLink.duration} minutes
    Password: ${meetingLink.password}`,
  };

  // const mailOptions = {
  //   from: "mulukendemis44@gmail.com",
  //   to: ["amsaledemismuller@gmail.com", "amsalelij@gmail.com"],
  //   subject: "Mentorship Session Confirmation",
  //   text: `Your mentorship session has been scheduled for ${meetingLink.meetingTime} UTC.
  //     Join the meeting using this link: ${meetingLink.meeting_url}.
  //     Purpose: ${meetingLink.purpose}
  //     Duration: ${meetingLink.duration} minutes
  //     Password: ${meetingLink.password}`,
  // };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
}

// const clientId = "TJ9Z44dEQbS9hkeI52v7KQ" || process.env.ZOOM_CLIENT_ID;
// const clientSecret =
//   "DG7KI0Vb3dNd1l0ufT2i5o458U0JzZbd" || process.env.ZOOM_CLIENT_SECRET;

// const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
//   "base64"
// );
// const authorizationHeader = `Basic ${base64Credentials}`;

// console.log(authorizationHeader);
// const clientId = process.env.ZOOM_CLIENT_ID;
// const clientSecret = process.env.ZOOM_CLIENT_SECRET;

// console.log("client id is ",clientId);
// console.log("clientSecret  is ", clientSecret);

const clientId =  "TJ9Z44dEQbS9hkeI52v7KQ";
const clientSecret ="DG7KI0Vb3dNd1l0ufT2i5o458U0JzZbd";

const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
  "base64"
);
const authorizationHeader = `Basic ${base64Credentials}`;

console.log(authorizationHeader);
const config = {
  method: "post",
  maxBodyLength: Infinity,
  url: "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=l090vxJgRLOuUdys1eQEDA",
  headers: {
    Authorization:authorizationHeader
  },
};

export const createZoomMeeting = async (topic, duration, start_time) => {
  try {
    let authResponse;
    await axios
      .request(config)
      .then((response) => {
        authResponse = response.data;
      })
      .catch((error) => {
        console.log(error);
        throw error; // Throw error to be caught by the caller
      });

    const access_token = authResponse.access_token;

    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };

    let data = JSON.stringify({
      topic: topic,
      type: 2,
      start_time: start_time,
      duration: 60,
      password: "12334",
      settings: {
        join_before_host: true,
        waiting_room: false,
      },
    });

    const api_base_url = "https://api.zoom.us/v2";
    const meetingResponse = await axios.post(
      `${api_base_url}/users/me/meetings`,
      data,
      { headers }
    );

    if (meetingResponse.status !== 201) {
      throw new Error("Unable to generate meeting link");
    }

    const response_data = meetingResponse.data;

    const content = {
      meeting_url: response_data.join_url,
      meetingTime: response_data.start_time,
      purpose: response_data.topic,
      duration: response_data.duration,
      message: "Success",
      password: response_data.password, // Added a comma here
      status: 1,
    };
    return content;
  } catch (e) {
    console.log(e);
    throw e; // Throw error to be caught by the caller
  }
};

export const bookAppointment = async (req, res) => {
  //menteeid and mentorid should be req.params
  const { mentorId, menteeId, date, startTime, endTime } = req.body;

  // Check for required parameters
  if (!mentorId || !menteeId || !date || !startTime || !endTime) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      mentorId,
      date,
      startTime,
      endTime,
    });

    if (conflictingAppointment) {
      return res.status(409).json({ message: "Time slot already booked" });
    }

    // Generate Zoom meeting link
    const meetingLink = await createZoomMeeting(date, startTime);
    console.log("meeting link kkkkkkkkkkkkkkk", meetingLink);
    // Create new appointment
    const newAppointment = new Appointment({
      mentorId,
      menteeId,
      date,
      startTime,
      endTime,
      meetingLink,
    });

    await newAppointment.save();

    // Send notification emails to mentor and mentee
    await sendBookingConfirmation(
      mentorId,
      menteeId,
      meetingLink,
      date,
      startTime
    );

    res.status(201).json({ message: "Appointment booked successfully" });
  } catch (err) {
    console.error("Error booking appointment:", err);
    res.status(500).json({ message: "Server error" });
  }
};
