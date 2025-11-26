import express from "express";
import { getAllUsers, getUser, loginUser, updateName, userProfile, verifyUser } from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";

const userRoutes = express.Router();

userRoutes.post("/login", loginUser);
userRoutes.post("/verify", verifyUser);
userRoutes.get("/profile", isAuth, userProfile);
userRoutes.put("/updateName", isAuth, updateName);
userRoutes.get("/users/all", isAuth, getAllUsers);
userRoutes.get("/users/:id", isAuth, getUser);

export default userRoutes;
