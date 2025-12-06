import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import tryCatch from "../config/tryCatch.js";
import { redisClient } from "../index.js";
import { AuthRequest } from "../middleware/isAuth.js";
import { User } from "../models/User.js";

export const loginUser = tryCatch(async (req, res) => {
  const { email } = req.body;
  const rateLimitKey = `otp:ratelimit;${email}`;
  const ratelimit = await redisClient.get(rateLimitKey);
  if (ratelimit) {
    return res.status(429).json({ message: "Too many requests. Please try again later." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${email}`;
  await redisClient.setEx(otpKey, 300, otp); // OTP valid for 5 minutes

  await redisClient.setEx(rateLimitKey, 60, '1'); // Rate limit for 1 minute

  const message = {
    to: email,
    subject: "Your OTP Code",
    body: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
  }

  await publishToQueue('send_otp_queue', message);

  res.status(200).json({
    message: "OTP sent to email."
  });
});

export const verifyUser = tryCatch(async (req, res) => {

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  const otpKey = `otp:${email}`;
  const storedOtp = await redisClient.get(otpKey);
  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }
  await redisClient.del(otpKey);

  let user = await User.findOne({ email });
  if (!user) {
    const username = email.slice(0, 8);
    user = await User.create({ username, email });
    await user.save();
  }

  const tokenPayload = generateToken(user);
  return res.status(200).json({
    message: "OTP verified successfully.",
    user,
    token: tokenPayload
  });
});

export const userProfile = tryCatch(async (req: AuthRequest, res) => {
  const user = req.user;
  return res.status(200).json(user);
});

export const updateName = tryCatch(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    return res.status(404).json({ message: "User not found. Pleage Login" });
  }
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }
  user.username = username;
  await user.save();
  const token = generateToken(user);
  return res.status(200).json({
    message: "Username updated successfully.",
    user,
    token
  });
});

export const getAllUsers = tryCatch(async (req: AuthRequest, res) => {
  const users = await User.find();
  return res.status(200).json(users);
});

export const getUser = tryCatch(async (req: AuthRequest, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  return res.status(200).json(user);
});