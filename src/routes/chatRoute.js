import express from "express";
import {
  accessChat,
  createGroupChat,
  fetchChats,
  sendMessage,
  allMessages,
  removeFromGroup,
  addToGroup,
  renameGroup,
} from "../controllers/chatController.js";
import { verifyToken } from "../middlewares/jwtMiddleware.js";

const chatRouter = express.Router();
chatRouter.get("/:chatId", verifyToken, allMessages);
chatRouter.post("/", verifyToken, sendMessage);
chatRouter.post("/access/:userId", verifyToken, accessChat);
chatRouter.get("/allchat", fetchChats);
chatRouter.post("/group", createGroupChat);
chatRouter.put("/group/rename", renameGroup);
chatRouter.put("/groupremove", verifyToken, removeFromGroup);
chatRouter.put("/group/add", addToGroup);

export default chatRouter;
