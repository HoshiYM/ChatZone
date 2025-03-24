import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", verifyToken, getUsersForSidebar);
router.get("/:id", verifyToken, getMessages);

router.post("/send/:id", verifyToken, sendMessage);

export default router;