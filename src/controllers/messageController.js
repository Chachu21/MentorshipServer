import Chat from "../models/chat.js";
import Message from "../models/message.js";
import User from "../models/users.js";

export const sendMessage = async (req, res) => {
  const { chatId, message, senderId, receiverId } = req.body;
  console.log("req.body am sidellllllllllllll");

  console.log("req.body", req.body);
  try {
    let msg = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message,
      chatId,
    });
    msg = await msg.populate("sender", "name email profilePic");
    msg = await msg.populate({
      path: "chatId",
      select: "chatName isGroup users",
      model: "Chat",
      populate: {
        path: "users",
        select: "name email profilePic",
        model: "User",
      },
    });
    await Chat.findByIdAndUpdate(sendorId, {
      latestMessage: msg,
    });
    res.status(200).send(msg);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

export const getMessages = async (req, res) => {
  const { sendorId } = req.params;
  try {
    let messages = await Message.find({ sendorId })
      .populate({
        path: "sender",
        model: "User",
        select: "name profilePic email",
      })
      .populate({
        path: "senderId",
        model: "Chat",
      });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const getUsersBySender = async (req, res) => {
  const senderId = req.params.senderId;

  try {
    // Find all messages where the sender is the given senderId
    const messages = await Message.find({ sender: senderId })
      .populate({
        path: "sender",
        select: "fullName email profileImage.url",
        model: "User",
      })
      .populate({
        path: "receiver",
        select: "fullName email profileImage.url",
        model: "User",
      });

    if (!messages || messages.length === 0) {
      return res
        .status(404)
        .json({ message: "No messages found for this sender" });
    }

    // Extract unique users from the messages
    const users = [];
    const userIds = new Set();

    messages.forEach((message) => {
      if (!userIds.has(message.receiver._id.toString())) {
        userIds.add(message.receiver._id.toString());
        users.push(message.receiver);
      }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
