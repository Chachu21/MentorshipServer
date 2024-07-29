import Chat from "../models/chat.js";
import Message from "../models/message.js";
import User from "../models/users.js";

export const sendMessage = async (req, res) => {
  const { chatId, message, senderId, receiverId } = req.body;
  try {
    let msg = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message,
      chatId,
      isRead: false,
    });
    msg = await msg.populate("sender", "fullName email profileImage");
    msg = await msg.populate({
      path: "chatId",
      select: "chatName isGroup users",
      model: "Chat",
      populate: {
        path: "users",
        select: "fullName email profileImage",
        model: "User",
      },
    });
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: msg,
    });
    res.status(200).send(msg);
  } catch (error) {
    // console.log(error);
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
        select: "fullNameame profileImage email",
      })
      .populate({
        path: "chatId",
        model: "Chat",
      });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
    // console.log(error);
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

export const allUsers = async (req, res) => {
  try {
    // Extract search query and role from request query parameters
    const { search } = req.query;

    // Build the search query based on the search string
    const searchQuery = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Fetch users based on the search query
    // Exclude users with role "admin" and the currently logged-in user
    const users = await User.find({
      ...searchQuery,
      role: { $ne: "admin" }, // Exclude users with role "admin"
      _id: { $ne: req.user._id }, // Exclude the currently logged-in user
    });
    // console.log(users);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUsersByMessageParticipants = async (req, res) => {
  try {
    const { userId } = req.query;

    // Ensure userId is provided
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch messages where the user is either the sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).populate("sender receiver");

    // Debugging: Check if messages are populated correctly

    // Extract unique user IDs from the messages, excluding the logged-in user
    const userIds = [
      ...new Set(
        messages.flatMap((message) => {
          if (message.sender && message.receiver) {
            return [
              message.sender._id.toString(),
              message.receiver._id.toString(),
            ];
          }
          return [];
        })
      ),
    ].filter((id) => id !== userId); // Exclude the logged-in user

    // Debugging: Check extracted user IDs

    // Fetch users based on extracted IDs
    const users = await User.find({ _id: { $in: userIds } });

    // Debugging: Check if users are being fetched

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
};
export const countUnreadMessages = async (req, res) => {
  try {
    // Count unread messages for the user
    const count = await Message.countDocuments({
      receiver: req.user,
      isRead: false,
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Error counting unread messages:", error);
  }
};
// controllers/messageController.js

export const markMessagesAsRead = async (req, res) => {
  const { chatId } = req.params;
  try {
    // Update messages for the specific chat where the receiver is the logged-in user
    const updatedMessages = await Message.updateMany(
      { chatId, receiver: req.user, isRead: false },
      { isRead: true },
      { new: true }
    );

    // Send a success response
    res
      .status(200)
      .json({ message: "Messages marked as read", updatedMessages });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: error.message });
  }
};
