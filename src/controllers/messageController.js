import Chat from "../models/chat.js";
import Message from "../models/message.js";
import User from "../models/users.js";

export const sendMessage = async (req, res) => {
  const { chatId, message, sendorId, receiverId } = req.body;
  try {
    let msg = await Message.create({
      sender: sendorId,
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
        path: "sendorId",
        model: "Chat",
      });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};
