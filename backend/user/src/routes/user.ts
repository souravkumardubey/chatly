import express from "express";
import { loginUser, userProfile, verifyUser } from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";

const userRoutes = express.Router();

userRoutes.post("/login", loginUser);
userRoutes.post("/verify", verifyUser);
userRoutes.get("/profile", isAuth, userProfile);

export default userRoutes;
