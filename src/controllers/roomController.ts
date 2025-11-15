import { Request, Response } from "express";
import { Room } from "../models/Room";
import mongoose from "mongoose";

export const createOrGetRoom = async (req: Request, res: Response) => {
  const { roomId } = req.params;

  let room = await Room.findOne({ roomId });
  if (!room) {
    room = await Room.create({ roomId, messages: [] });
  }

  return res.status(200).json(room);
};

export const uploadVoice = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { username } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No voice file provided" });
  }

  try {
    // File is already uploaded to GridFS via multer
    // req.file.id contains the GridFS file ID
    const fileId = (req.file as any).id;

    // Create URL for accessing the file
    const voiceUrl = `/api/voice/${fileId}`;

    // Save voice message to DB
    const msgData = {
      username,
      message: "Voice message",
      type: "voice",
      url: voiceUrl,
    };

    await Room.findOneAndUpdate({ roomId }, { $push: { messages: msgData } });

    return res.status(200).json({ url: voiceUrl });
  } catch (error) {
    console.error("GridFS upload error:", error);
    return res.status(500).json({ error: "Failed to upload voice file" });
  }
};
