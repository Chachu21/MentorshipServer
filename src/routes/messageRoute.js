import express from "express";
const messageRouter = express.Router();
import { sendMessage, getMessages } from "../controllers/messageController.js";
messageRouter.post("/", sendMessage);
messageRouter.get("/:chatId", getMessages);
export default messageRouter;
