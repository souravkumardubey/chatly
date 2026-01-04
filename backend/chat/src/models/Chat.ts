import mongoose, { Document, Schema } from "mongoose";

export interface Chat extends Document {
    users: string[];
    latest: {
        text: string;
        sender: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const chatSchema: Schema<Chat> = new Schema({
    users: { type: [String], required: true },
    latest: {
        text: { type: String },
        sender: { type: String },
    },
}, {
    timestamps: true,
});

export const Chat = mongoose.model<Chat>("Chat", chatSchema);