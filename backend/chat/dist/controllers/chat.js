import axios from "axios";
import tryCatch from "../config/tryCatch.js";
import { Chat } from "../models/Chat.js";
import { Messages } from "../models/Messages.js";
export const createNewChat = tryCatch(async (req, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;
    if (!otherUserId) {
        return res.status(400).json({ message: "Other user id is required" });
    }
    const existingChat = await Chat.findOne({
        users: { $all: [userId, otherUserId], $size: 2 },
    });
    if (existingChat) {
        return res.status(200).json({
            message: "Chat already exists",
            chatId: existingChat._id,
        });
    }
    const newChat = await Chat.create({
        users: [userId, otherUserId],
    });
    res.status(201).json({
        message: "Chat created successfully",
        chatId: newChat._id,
    });
});
export const getAllChats = tryCatch(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });
    const chatWithUserData = await Promise.all(chats.map(async (chat) => {
        const otherUserId = chat.users.find((user) => user !== userId);
        const unseenCount = await Messages.countDocuments({
            chatId: chat._id,
            sender: { $ne: userId },
            seen: false,
        });
        try {
            const data = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);
            return {
                user: data,
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latest || null,
                    unseenCount,
                }
            };
        }
        catch (error) {
            console.log(error);
            return {
                user: {
                    _id: otherUserId,
                    name: "Unknown",
                },
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latest || null,
                    unseenCount,
                }
            };
        }
    }));
    return res.status(200).json({
        message: "Chats fetched successfully",
        chats: chatWithUserData,
    });
});
