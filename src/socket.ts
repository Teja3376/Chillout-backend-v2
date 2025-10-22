import { Server } from "socket.io";
import { Room } from "./models/Room";

// Map to track online users per room: roomId -> Set of usernames
const onlineUsersPerRoom = new Map<string, Set<string>>();

export const initSocket = (server: any) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on("join_room", async ({ roomId, username }) => {
      socket.join(roomId);
      socket.data.username = username; // Store username in socket data for disconnect handling

      // Add user to the room's online users set
      if (!onlineUsersPerRoom.has(roomId)) {
        onlineUsersPerRoom.set(roomId, new Set());
      }
      onlineUsersPerRoom.get(roomId)!.add(username);

      console.log(`${username} joined room ${roomId}`);

      // Emit the updated list of online users to all clients in the room
      const onlineUsers = Array.from(onlineUsersPerRoom.get(roomId)!);
      io.in(roomId).emit("online_users", onlineUsers);
    });

    socket.on("send_message", async ({ roomId, username, message }) => {
      const msgData = { username, message, type: "text" };
      await Room.findOneAndUpdate({ roomId }, { $push: { messages: msgData } });

      io.in(roomId).emit("receive_message", msgData);
    });

    socket.on("disconnect", () => {
      const username = socket.data.username;
      if (username) {
        // Remove user from all rooms they were in
        for (const [roomId, users] of onlineUsersPerRoom.entries()) {
          if (users.has(username)) {
            users.delete(username);
            // Emit updated online users list to the room
            const onlineUsers = Array.from(users);
            io.in(roomId).emit("online_users", onlineUsers);
          }
        }
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
