import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { sendErrorResponse } from "./errorHandler.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;

        if (!token)
            return sendErrorResponse(res, 401, "Không có token được cung cấp.");

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError')
                    return sendErrorResponse(res, 401, 'Token đã hết hạn.');
                else
                    return sendErrorResponse(res, 401, 'Token không hợp lệ.');
            }

            const user = await User.findById(decoded.id).select('-password').lean();

            if (!user)
                return sendErrorResponse(res, 404, 'Người dùng không tồn tại.');
        });

        req.user = user;

        next();
    } catch (error) {
        return sendErrorResponse(res, 500, "xác thực token", error);
    }
};