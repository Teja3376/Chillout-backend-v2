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
      socket.data.roomId = roomId;

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
      const updatedRoom = await Room.findOneAndUpdate(
        { roomId },
        { 
          $push: { messages: msgData },
          $set: { lastActivity: new Date() }
        },
        { new: true }
      );

      // Get the last message (the one we just added) with its _id
      const savedMessage = updatedRoom?.messages[updatedRoom.messages.length - 1];

      io.in(roomId).emit("receive_message", savedMessage);
    });

    socket.on("send_voice_message", async ({ roomId, username, url }) => {
      const msgData = {
        username,
        message: "Voice message",
        type: "voice",
        url,
      };
      const updatedRoom = await Room.findOneAndUpdate(
        { roomId },
        { 
          $push: { messages: msgData },
          $set: { lastActivity: new Date() }
        },
        { new: true }
      );

      const savedMessage = updatedRoom?.messages[updatedRoom.messages.length - 1];

      io.in(roomId).emit("receive_voice_message", savedMessage);
    });

    socket.on("send_image_message", async ({ roomId, username, url }) => {
      const msgData = {
        username,
        message: "Image message",
        type: "image",
        url,
      };
      const updatedRoom = await Room.findOneAndUpdate(
        { roomId },
        { 
          $push: { messages: msgData },
          $set: { lastActivity: new Date() }
        },
        { new: true }
      );

      const savedMessage = updatedRoom?.messages[updatedRoom.messages.length - 1];

      // Broadcast to others in the room (not the sender)
      socket.broadcast.to(roomId).emit("receive_image_message", savedMessage);
      
      // Send back to sender with their own message
      socket.emit("receive_image_message", savedMessage);
    });

    socket.on("delete_message", async ({ roomId, messageId }) => {
      try {
        await Room.findOneAndUpdate(
          { roomId },
          { $pull: { messages: { _id: messageId } } }
        );
        io.in(roomId).emit("message_deleted", { messageId });
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    });

    // --- WebRTC Signaling Events ---

    socket.on("join_call", async ({ roomId, username }) => {
      console.log(`${username} joining call in ${roomId}`);
      
      // Send call notification message to chat
      const callNotification = {
        username: "System",
        message: `${username} is in the audio call`,
        type: "call_notification",
        callInitiator: username,
      };
      await Room.findOneAndUpdate({ roomId }, { $push: { messages: callNotification } });
      io.in(roomId).emit("call_notification", callNotification);
      
      // Broadcast to others in the room that a user joined the call
      socket.to(roomId).emit("user_joined_call", { socketId: socket.id, username });
    });

    socket.on("offer", ({ to, offer, username }) => {
      console.log(`Sending offer from ${socket.id} to ${to}`);
      io.to(to).emit("offer", { from: socket.id, offer, username });
    });

    socket.on("answer", ({ to, answer, username }) => {
      console.log(`Sending answer from ${socket.id} to ${to}`);
      io.to(to).emit("answer", { from: socket.id, answer, username });
    });

    socket.on("ice_candidate", ({ to, candidate }) => {
      console.log(`Sending ICE candidate from ${socket.id} to ${to}`);
      io.to(to).emit("ice_candidate", { from: socket.id, candidate });
    });

    socket.on("leave_call", async ({ roomId, username }) => {
      console.log(`${username} leaving call in ${roomId}`);
      
      // Send call ended notification to chat
      const callEndedNotification = {
        username: "System",
        message: `${username} left the audio call`,
        type: "call_ended",
      };
      await Room.findOneAndUpdate({ roomId }, { $push: { messages: callEndedNotification } });
      io.in(roomId).emit("call_ended_notification", callEndedNotification);
      
      socket.to(roomId).emit("user_left_call", { socketId: socket.id });
    });

    // -------------------------------

    socket.on("disconnect", () => {
      const username = socket.data.username;
      const roomId = socket.data.roomId; // We need to store roomId on socket.data to access it here efficiently if possible, or iterate
      
      if (username) {
        // Remove user from all rooms they were in (using the map iteration as before is fine, but we can optimize if we stored roomId)
        // Keeping original logic for safety + adding call cleanup
        
        for (const [rId, users] of onlineUsersPerRoom.entries()) {
          if (users.has(username)) {
            users.delete(username);
            // Emit updated online users list to the room
            const onlineUsers = Array.from(users);
            io.in(rId).emit("online_users", onlineUsers);
            
            // Also emit user_left_call just in case they disconnected while in a call
            io.in(rId).emit("user_left_call", { socketId: socket.id });
          }
        }
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
