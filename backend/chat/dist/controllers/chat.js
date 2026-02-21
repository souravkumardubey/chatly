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
export const sendMessage = tryCatch(async (req, res) => {
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const imageFile = req.file;
    if (!senderId) {
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }
    if (!chatId) {
        res.status(400).json({
            message: "Chat id is required"
        });
        return;
    }
    if (!text && !imageFile) {
        res.status(400).json({
            message: "Message or image is required"
        });
        return;
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404).json({
            message: "Chat not found"
        });
        return;
    }
    const isUserInChat = chat.users.some((userId) => userId.toString() === senderId.toString());
    if (!isUserInChat) {
        res.status(403).json({
            message: "You are not a participant of this chat."
        });
        return;
    }
    const otherUserId = chat.users.find((userId) => userId.toString() !== senderId.toString());
    if (!otherUserId) {
        res.status(401).json({
            message: "No other user"
        });
        return;
    }
    // socker setup
    let messageData = {
        chatId: chatId,
        senderId: senderId,
        seen: false,
        seenAt: undefined,
    };
    if (imageFile) {
        messageData.image = {
            url: imageFile.path,
            publicId: imageFile.filename,
        };
        messageData.messageType = "image";
        messageData.text = text || "";
    }
    else {
        messageData.text = text;
        messageData.messageType = "text";
    }
    const message = new Messages(messageData);
    const savedMessage = await message.save();
    const latestMessageText = imageFile ? "📷 Image" : text;
    await Chat.findByIdAndUpdate(chatId, {
        latest: {
            text: latestMessageText,
            sender: senderId,
        },
        updatedAt: new Date(),
    }, {
        new: true
    });
    // emit to socket
    res.status(201).json({
        message: savedMessage,
        sender: senderId,
    });
});
