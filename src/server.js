import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import createDatabase from "./config/dbConfig.js";
import userRouter from "./routes/userRoute.js";
import chatRouter from "./routes/chatRoute.js";
import messageRouter from "./routes/messageRoute.js";
import commentRouter from "./routes/commentRoutes.js";
import recommendationRouter from "./routes/recommendationRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import availablityRouter from "./routes/availablityRoute.js";
import appointmentRouter from "./routes/appointmentRoute.js";
import mentorshipRoute from "./routes/mentorshipRoute.js";
import attendanceRoutes from "./routes/attendanceRoute.js";
import contractRoute from "./routes/contractRoute.js";
import proposalRouter from "./routes/proposalRoute.js";
import feedbackRouter from "./routes/feedbackRoute.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import Message from "../src/models/message.js";
import Chat from "./models/chat.js";

// Initialize environment variables
dotenv.config();

// Instantiate Express
const app = express();
const port = process.env.PORT || 5000;

// Create an HTTP server
const server = createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust to your needs
    methods: ["GET", "POST"],
  },
});

// Connect to the database
createDatabase();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Basic route
app.get("/", (req, res) => {
  res.send("This is the Mentorship server!");
});

// Define your routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/feedback", feedbackRouter);
app.use("/api/v1/recommend", recommendationRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/availablity", availablityRouter);
app.use("/api/v1/appoint", appointmentRouter);
app.use("/api/v1/mentorship", mentorshipRoute);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/contract", contractRoute);
app.use("/api/v1/proposal", proposalRouter);

// Socket.IO event handling
io.on("connection", (socket) => {
  // console.log("Connected to Socket.IO");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (chatId) => {
    socket.join(chatId);
    console.log("User joined room:", chatId);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("sendMessage", async (data) => {
    try {
      const { chatId, message, senderId } = data;
      let msg = await Message.create({ sender: senderId, message, chatId });
      msg = await msg.populate("sender", "fullName email profileImage");

      msg = await msg.populate({
        path: "chatId",
        select: "chatName isGroup users",
        populate: {
          path: "users",
          select: "name email profilePic",
        },
      });

      await Chat.findByIdAndUpdate(chatId, { latestMessage: msg });
      io.to(chatId).emit("messageReceived", msg);
    } catch (error) {
      console.error("Error handling sendMessage event:", error);
    }
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
