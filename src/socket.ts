import { Server } from "socket.io";
import { Room } from "./models/Room";

export const initSocket = (server: any) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on("join_room", async ({ roomId, username }) => {
      socket.join(roomId);
      console.log(`${username} joined room ${roomId}`);
    });

    socket.on("send_message", async ({ roomId, username, message }) => {
      const msgData = { username, message, type: "text" };
      await Room.findOneAndUpdate(
        { roomId },
        { $push: { messages: msgData } }
      );

      io.in(roomId).emit("receive_message", msgData);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
