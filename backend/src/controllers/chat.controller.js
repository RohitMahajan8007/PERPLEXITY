import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js";
import mongoose from "mongoose";

export async function sendMessage(req, res) {
    try {
        const { message, chat: chatId } = req.body;
        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }


        let title = null, chat = null;

        if (!chatId) {
            title = await generateChatTitle(message);
            chat = await chatModel.create({
                user: req.user.id,
                title
            })
        } else {
            chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
            if (!chat) {
                return res.status(404).json({ message: "Chat not found" });
            }
        }

        const userMessage = await messageModel.create({
            chat: chatId || chat._id,
            content: message,
            role: "user"
        })

        // Use .lean() to get plain JS objects instead of Mongoose documents
        const messages = await messageModel.find({ chat: chatId || chat._id }).sort({ createdAt: 1 }).lean()

        const result = await generateResponse(messages);

        const aiMessage = await messageModel.create({
            chat: chatId || chat._id,
            content: result,
            role: "ai"
        })


        res.status(201).json({
            title,
            chat,
            aiMessage
        })
    } catch (err) {
        console.error("SendMessage Error:", err);
        res.status(500).json({ message: "AI response failed", error: err.message });
    }
}

export async function getChats(req, res) {
    const user = req.user

    const chats = await chatModel.find({ user: user.id })

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    })
}

export async function getMessages(req, res) {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ message: "Invalid Chat ID" });
    }

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    const messages = await messageModel.find({
        chat: chatId
    })

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages
    })
}

export async function deleteChat(req, res) {

    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ message: "Invalid Chat ID" });
    }

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })

    await messageModel.deleteMany({
        chat: chatId
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    res.status(200).json({
        message: "Chat deleted successfully"
    })
}