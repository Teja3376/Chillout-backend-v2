import { Request, Response } from "express";
import { Room } from "../models/Room";

export const createOrGetRoom = async (req: Request, res: Response) => {
  const { roomId } = req.params;

  let room = await Room.findOne({ roomId });
  if (!room) {
    room = await Room.create({ roomId, messages: [] });
  }

  return res.status(200).json(room);
};
