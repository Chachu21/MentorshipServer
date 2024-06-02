import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";
import createDatabase from "./config/dbConfig.js";
import userRouter from "./routes/userRoute.js";
import chatRouter from "./routes/chatRoute.js";
import { createServer } from "node:http";
import { Server } from "socket.io";

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import commetRouter from "./routes/commentRoutes.js";
import recommendationRouter from "./routes/recommendationRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import availablityRouter from "./routes/availablityRoute.js";
import appointmentRouter from "./routes/appointmentRoute.js";

import mentorshipRoute from "./routes/mentorshipRoute.js";
//instantait the express
const app = express();
const port = process.env.PORT || 5000;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

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

// Serve static files
app.use(express.static(join(__dirname)));

// Define your routes here
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/comment", commetRouter);
app.use("/api/v1/recommend", recommendationRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/availablity", availablityRouter);
app.use("/api/v1/appoint", appointmentRouter);
app.use("/api/v1/mentorship", mentorshipRoute);

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

// Start the server
server.listen(port, () => {
  console.log("server running at http://localhost:5000");
});
