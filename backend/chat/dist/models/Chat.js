import mongoose, { Schema } from "mongoose";
const chatSchema = new Schema({
    users: { type: [String], required: true },
    latest: {
        text: { type: String },
        sender: { type: String },
    },
}, {
    timestamps: true,
});
export const Chat = mongoose.model("Chat", chatSchema);
