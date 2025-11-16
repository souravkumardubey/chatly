import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
dotenv.config();
connectDB();
const app = express();
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`User service is running at http://localhost:${port}`);
});
