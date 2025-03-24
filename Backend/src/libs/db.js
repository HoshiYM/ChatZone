import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Kết nối MongoDB thành công: ${conn.connection.host}`);
    } catch (error) {
        console.log("Đã xảy ra lỗi khi kết nối MongoDB: ", error);
    }
};