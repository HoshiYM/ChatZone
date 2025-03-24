import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../libs/cloudinary.js";
import { getReceiverSocketId, io } from "../libs/socket.js";
import { sendErrorResponse } from "../libs/errorHandler.js";


export const getUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        return res.status(200).json({ success: true, users: filteredUsers });
    } catch (error) {
        return sendErrorResponse(res, 500, "lấy danh sách người dùng", error);
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        });

        return res.status(200).json({ success: true, messages });
    } catch (error) {
        return sendErrorResponse(res, 500, "lấy tin nhắn", error);
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        let imageUrl;

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json({ success: true, newMessage });
    } catch (error) {
        return sendErrorResponse(res, 500, "gửi tin nhắn", error);
    }
};