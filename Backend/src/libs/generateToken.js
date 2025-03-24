import jwt from "jsonwebtoken";

export const generateAccessToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5m",
    });

    res.cookie("accessToken", token, {
        maxAge: 5 * 60 * 1000, // Milliseconds
        httpOnly: true, // Ngăn chặn các cuộc tấn công XSS (Cross-Site Scripting)
        sameSite: "strict", // Ngăn chặn các cuộc tấn công CSRF (Cross-Site Request Forgery)
        secure: process.env.NODE_ENV !== "development",
    });

    return token;
};

export const generateRefreshToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("refreshToken", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // Milliseconds
        httpOnly: true, // Ngăn chặn các cuộc tấn công XSS (Cross-Site Scripting)
        sameSite: "strict", // Ngăn chặn các cuộc tấn công CSRF (Cross-Site Request Forgery)
        secure: process.env.NODE_ENV !== "development",
    });

    return token;
};