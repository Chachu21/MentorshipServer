import express from "express";
const messageRouter = express.Router();
import {
  sendMessage,
  getMessages,
  allUsers,
  getUsersByMessageParticipants,
  markMessagesAsRead,
} from "../controllers/messageController.js";
import { verifyToken } from "../middlewares/jwtMiddleware.js";
messageRouter.get("/users", verifyToken, allUsers);
messageRouter.get("/chated/user", getUsersByMessageParticipants);
messageRouter.post("/", sendMessage);
messageRouter.get("/:chatId", getMessages);
messageRouter.put("/markMessagesAsRead/:chatId", markMessagesAsRead);

export default messageRouter;
