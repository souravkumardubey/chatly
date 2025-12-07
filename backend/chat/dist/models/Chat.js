import mongoose, { Schema } from "mongoose";
const chatSchema = new Schema({
    users: { type: [String], required: true },
    latest: { type: String, required: true },
}, {
    timestamps: true,
});
export const Chat = mongoose.model("Chat", chatSchema);
