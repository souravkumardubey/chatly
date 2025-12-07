import express from "express";
import { createNewChat } from "../controllers/chat.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/char/new", isAuth, createNewChat);

export default router;