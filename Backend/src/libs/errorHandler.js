export const sendErrorResponse = (res, status, message, error) => {
    if (status == 500) {
        message = `Đã xảy ra lỗi trong quá trình ${message}. Vui lòng thử lại sau.`;
        console.log(`Lỗi trong quá trình ${message}: `, error.message);
    }

    return res.status(status).json({ success: false, message });
};