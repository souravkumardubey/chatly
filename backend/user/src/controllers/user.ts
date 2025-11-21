import { publishToQueue } from "../config/rabbitmq.js";
import tryCatch from "../config/tryCatch.js";
import { redisClient } from "../index.js";

export const loginUser = tryCatch(async (req, res) => {
  const {email} = req.body;
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