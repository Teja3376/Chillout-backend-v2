import mongoose, { Schema, model } from "mongoose";

const messageSchema = new Schema({
  username: String,
  message: String,
  type: { type: String, default: "text" },
  createdAt: { type: Date, default: Date.now },
});

const roomSchema = new Schema({
  roomId: { type: String, unique: true },
  messages: [messageSchema],
});

export const Room = model("Room", roomSchema);
