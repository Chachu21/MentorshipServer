import Chat from "../models/chat.js";
import Message from "../models/message.js";
import User from "../models/users.js";

// Create or fetch One to One Chatexport const accessChat = async (req, res) => {
export const accessChat = async (req, res) => {
  const id = req.user;
  const { userId } = req.params;

  if (!userId) {
    // console.log("userId param not sent with request");
    return res.sendStatus(400);
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { participants: { $elemMatch: { $eq: req.user } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("participants", "-password")
      .populate("messages.sender");

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        participants: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "participants",
        "-password"
      );
      res.status(200).json(fullChat);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("participants", "-password")
      .populate("groupAdmin", "-password")
      .populate("messages")
      .sort({ updatedAt: -1 });

    const populatedChats = await User.populate(chats, {
      path: "messages.sender",
      select: "name pic email",
    });

    res.status(200).send(populatedChats);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export const createGroupChat = async (req, res) => {
  const { users, name, groupAdmin } = req.body;

  if (!users || !name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  try {
    const groupChat = await Chat.create({
      chatName: name,
      participants: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("participants", "-password")
      .populate("groupAdmin");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

// Controller to get all group chats the user is a participant in
export const getUserGroupChats = async (req, res) => {
  try {
    const userId = req.user._id;
    // console.log(userId);

    const groupChats = await Chat.find({
      isGroupChat: true,
      participants: { $in: [userId] },
    }).populate("chatName");

    res.status(200).json(groupChats);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export const renameGroup = async (req, res) => {
  const { id, chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      id,
      { chatName: chatName },
      { new: true }
    )
      .populate("participants", "-password")
      .populate("groupAdmin");

    if (!updatedChat) {
      res.status(404).send("Chat Not Found");
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export const removeFromGroup = async (req, res) => {
  const { chatId, id } = req.body;

  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { participants: id } },
      { new: true }
    )
      .populate("participants", "-password")
      .populate("groupAdmin");

    if (!removed) {
      res.status(404).send("Chat Not Found");
    } else {
      res.json(removed);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export const addToGroup = async (req, res) => {
  const { chatId, id } = req.body;

  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { participants: id } },
      { new: true }
    )
      .populate("participants", "-password")
      .populate("groupAdmin");

    if (!added) {
      res.status(404).send("Chat Not Found");
    } else {
      res.json(added);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    // console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, {
      path: "chat.participants",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};
