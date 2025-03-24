import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import cloudinary from "../libs/cloudinary.js";
import { generateAccessToken, generateRefreshToken } from "../libs/generateToken.js";
import { sendErrorResponse } from "../libs/errorHandler.js";

const validateSignupInput = (email, fullname, username, password, confirmPassword) => {
    if (!email || !fullname || !username || !password || !confirmPassword) {
        return "Vui lòng nhập đầy đủ thông tin.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Email không hợp lệ.";
    }

    if (password.length < 6) {
        return "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (password !== confirmPassword) {
        return "Mật khẩu xác nhận không khớp.";
    }

    return null;
};

export const signup = async (req, res) => {
    const { email, fullname, username, password, confirmPassword } = req.body;
    try {
        const validationError = validateSignupInput(email, fullname, username, password, confirmPassword);

        if (validationError)
            return sendErrorResponse(res, 400, validationError);

        const existingEmail = await User.findOne({ email });

        if (existingEmail)
            return sendErrorResponse(res, 400, "Email này đã được sử dụng.");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            email,
            username,
            password: hashedPassword,
        });

        generateAccessToken(newUser._id, res);
        generateRefreshToken(newUser._id, res);
        await newUser.save();

        const userData = {
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        };

        return res.status(201).json({ success: true, message: "Đăng ký thành công.", user: userData });
    } catch (error) {
        return sendErrorResponse(res, 500, "đăng ký", error);
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return sendErrorResponse(res, 400, "Vui lòng nhập đầy đủ thông tin.");
        }

        const user = await User.findOne({ email });

        if (!user)
            return sendErrorResponse(res, 400, "Thông tin đăng nhập không chính xác.");

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect)
            return sendErrorResponse(res, 400, "Thông tin đăng nhập không chính xác.");

        generateAccessToken(newUser._id, res);
        generateRefreshToken(newUser._id, res);

        const userData = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        };

        res.status(200).json({ success: true, message: "Đăng nhập thành công.", user: userData });
    } catch (error) {
        return sendErrorResponse(res, 500, "đăng nhập", error);
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        return res.status(200).json({ success: true, message: "Đăng xuất thành công." });
    } catch (error) {
        return sendErrorResponse(res, 500, "đăng xuất", error);
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic)
            return sendErrorResponse(res, 400, "Vui lòng chọn một ảnh.");

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        return res.status(200).json({ success: true, message: "Cập nhật thông tin tài khoản thành công.", user: updatedUser });
    } catch (error) {
        return sendErrorResponse(res, 500, "cập nhật thông tin tài khoản", error);
    }
};

export const checkAuth = (req, res) => {
    try {
        return res.status(200).json({ success: true, user: req.user });
    } catch (error) {
        return sendErrorResponse(res, 500, "kiểm tra xác thực", error);
    }
};