import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import createDatabase from "./config/dbConfig.js";
import userRouter from "./routes/userRoute.js";
import chatRouter from "./routes/chatRoute.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import commetRouter from "./routes/commentRoutes.js";
import recommendationRouter from "./routes/recommendationRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import availablityRouter from "./routes/availablityRoute.js";
import appointmentRouter from "./routes/appointmentRoute.js";
import mentorshipRoute from "./routes/mentorshipRoute.js";
import messageRouter from "./routes/messageRoute.js";
import attendanceRoutes from "./routes/attendanceRoute.js";
import contractRoute from "./routes/contractRoute.js";
import proposalRouter from "./routes/proposalRoute.js";
import feedbackRouter from "./routes/feedbackRoute.js";
//instantait the express
const app = express();
const port = process.env.PORT || 5000;

const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
});

dotenv.config();
//connect to the database
createDatabase();
// Middleware
app.use(cors());
// Increase the limit for request payload size
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.get("/", (req, res) => {
  res.send("this is mentorship for all !");
});
// Serve static files

// Define your routes here
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/comment", commetRouter);
app.use("/api/v1/recommend", recommendationRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/availablity", availablityRouter);
app.use("/api/v1/appoint", appointmentRouter);
app.use("/api/v1/mentorship", mentorshipRoute);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/contract", contractRoute);
app.use("/api/v1/proposal", proposalRouter);
app.use("/api/v1/feedback", feedbackRouter);

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (chatId) => {
    socket.join(chatId);
    console.log("User Joined Room: " + chatId);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("sendMessage", async (data) => {
    const { chatId, message, senderId } = data;

    let msg = await Message.create({ sender: senderId, message, chatId });
    msg = await msg.populate("sender", "name email profilePic").execPopulate();
    msg = await msg
      .populate({
        path: "chatId",
        select: "chatName isGroup users",
        model: "Chat",
        populate: {
          path: "users",
          select: "name email profilePic",
          model: "User",
        },
      })
      .execPopulate();
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: msg,
    });

    io.to(chatId).emit("messageReceived", msg);
  });
});

// Start the server
server.listen(port, () => {
  console.log("server running at http://localhost:5000");
});
