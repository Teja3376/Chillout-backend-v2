import mongoose, { Schema, model } from "mongoose";

const messageSchema = new Schema({
  username: String,
  message: String,
  type: { type: String, default: "text" },
  url: { type: String, default: null }, // For voice messages, store the file path
  createdAt: { type: Date, default: Date.now },
});

const roomSchema = new Schema({
  roomId: { type: String, unique: true },
  messages: [messageSchema],
  lastActivity: { type: Date, default: Date.now }, // Track last activity for TTL
});

// TTL index: automatically delete rooms after 30 days (2592000 seconds) of inactivity
roomSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 2592000 });

export const Room = model("Room", roomSchema);
