import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { createClient } from "redis";
dotenv.config();
connectDB();
export const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true,
        rejectUnauthorized: false,
    },
});
redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch((err) => {
    console.error('Redis connection error:', err);
});
const app = express();
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`User service is running at http://localhost:${port}`);
});
