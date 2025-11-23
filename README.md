# Chillout Backend v2

## Description

Chillout Backend v2 is a Node.js-based backend service for a real-time chat application. It provides RESTful API endpoints for managing chat rooms, handles file uploads via MongoDB GridFS, and integrates Socket.IO for real-time messaging and user presence tracking. The application uses MongoDB as the database to store room data, messages, and media files.

## Features

### Core Features
- Create or retrieve chat rooms by room ID
- Real-time messaging within rooms (text, voice, and images)
- Voice message upload and retrieval using MongoDB GridFS
- Image upload and retrieval using MongoDB GridFS
- Message deletion functionality
- Track online users per room

### Advanced Features
- **Group Audio Calls**: WebRTC signaling for peer-to-peer audio calls
  - Join/leave call events
  - WebRTC offer/answer/ICE candidate exchange
  - Call notification messages in chat
- **Automatic Room Cleanup**: Rooms are automatically deleted after 30 days of inactivity
  - Uses MongoDB TTL (Time To Live) index
  - Activity tracked on every message sent
  - Keeps database clean and optimized
- **Media Storage**: Efficient file storage using MongoDB GridFS
  - Supports voice messages (audio/webm)
  - Supports images (image/*)
  - Automatic file cleanup when messages are deleted

### Configuration
- CORS support for cross-origin requests
- Environment-based configuration
- Health check endpoint for monitoring

## Tech Stack

- **Runtime**: Node.js 20.x
- **Language**: TypeScript 5.9.2
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM 8.19.4
- **Real-time Communication**: Socket.IO 4.8.1
- **File Upload**: Multer 2.0.2
- **Other Libraries**:
  - `cors`: For handling Cross-Origin Resource Sharing
  - `dotenv`: For environment variable management
- **Development Tools**:
  - `nodemon`: For automatic server restarts during development
  - `ts-node`: For running TypeScript directly
  - `typescript`: For TypeScript compilation
  - `@types/express`, `@types/node`, `@types/multer`: Type definitions

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Teja3376/Chillout-backend-v2.git
   cd Chillout-backend-v2
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chillout?retryWrites=true&w=majority
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   ```

   **Note**: Replace `chillout` in the MONGO_URI with your desired database name. The `/chillout` part specifies which database to use in your MongoDB cluster.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. For production, build and start:
   ```bash
   npm run build
   npm start
   ```

## Usage

The server will run on `http://localhost:PORT` (default 5000). It connects to MongoDB and initializes Socket.IO for real-time features.

## API Endpoints

### Room Management

#### GET /api/room/:roomId

Retrieves or creates a room with the specified `roomId`.

- **Parameters**:
  - `roomId` (string): The unique identifier for the room.

- **Response**:
  - Status: 200 OK
  - Body: JSON object representing the room, including `roomId` and `messages` array.

Example:

```bash
GET /api/room/abc123
```

Response:

```json
{
  "roomId": "abc123",
  "messages": [
    {
      "username": "user1",
      "message": "Hello!",
      "type": "text",
      "createdAt": "2023-10-01T12:00:00.000Z"
    }
  ]
}
```

### Media Upload

#### POST /api/room/:roomId/voice

Uploads a voice message file to the specified room.

- **Parameters**:
  - `roomId` (string): The unique identifier for the room.
  - `voice` (file): The voice message file (multipart/form-data).
  - `username` (string): The username of the sender.

- **Response**:
  - Status: 200 OK
  - Body: JSON object with the URL to access the uploaded voice file.

Example:

```bash
POST /api/room/abc123/voice
Content-Type: multipart/form-data
Body: voice=<file>, username=user1
```

Response:

```json
{
  "url": "/api/voice/507f1f77bcf86cd799439011"
}
```

#### POST /api/room/:roomId/image

Uploads an image file to the specified room.

- **Parameters**:
  - `roomId` (string): The unique identifier for the room.
  - `image` (file): The image file (multipart/form-data).
  - `username` (string): The username of the sender.

- **Response**:
  - Status: 200 OK
  - Body: JSON object with the URL to access the uploaded image.

Example:

```bash
POST /api/room/abc123/image
Content-Type: multipart/form-data
Body: image=<file>, username=user1
```

Response:

```json
{
  "url": "/api/image/507f1f77bcf86cd799439011"
}
```

### Media Retrieval

#### GET /api/voice/:fileId

Retrieves a voice message file by its GridFS file ID.

- **Parameters**:
  - `fileId` (string): The MongoDB ObjectId of the voice file.

- **Response**:
  - Status: 200 OK
  - Body: The voice file data (audio/webm).

#### GET /api/image/:fileId

Retrieves an image file by its GridFS file ID.

- **Parameters**:
  - `fileId` (string): The MongoDB ObjectId of the image file.

- **Response**:
  - Status: 200 OK
  - Body: The image file data (image/*).

### Message Management

#### DELETE /api/message/:messageId

Deletes a message and its associated media file (if any).

- **Parameters**:
  - `messageId` (string): The MongoDB ObjectId of the message.

- **Response**:
  - Status: 200 OK
  - Body: Success message.

### Health Check

#### GET /api/health

Health check endpoint for monitoring server status.

- **Response**:
  - Status: 200 OK
  - Body: `{ status: "ok", timestamp: "..." }`

## Socket.IO Events

The backend uses Socket.IO for real-time communication. Connect to the server using a Socket.IO client.

### Client → Server Events

- **join_room**: Join a room and notify others.
  - Payload: `{ roomId: string, username: string }`
  - Emits: `online_users` to all in room with updated list.

- **send_message**: Send a text message to a room.
  - Payload: `{ roomId: string, username: string, message: string }`
  - Emits: `receive_message` to all in room with message data.

- **send_voice_message**: Send a voice message to a room.
  - Payload: `{ roomId: string, username: string, url: string }`
  - Emits: `receive_voice_message` to all in room with message data.

- **send_image_message**: Send an image message to a room.
  - Payload: `{ roomId: string, username: string, url: string }`
  - Emits: `receive_image_message` to all in room with message data.

- **delete_message**: Delete a message from a room.
  - Payload: `{ roomId: string, messageId: string }`
  - Emits: `message_deleted` to all in room.

- **join_call**: Join an audio call in a room.
  - Payload: `{ roomId: string, username: string }`
  - Emits: `user_joined_call` to others in room, `call_notification` to all.

- **leave_call**: Leave an audio call.
  - Payload: `{ roomId: string, username: string }`
  - Emits: `user_left_call` to others in room, `call_ended_notification` to all.

- **offer**: Send WebRTC offer for peer connection.
  - Payload: `{ to: string, offer: RTCSessionDescriptionInit, username: string }`
  - Emits: `offer` to target peer.

- **answer**: Send WebRTC answer for peer connection.
  - Payload: `{ to: string, answer: RTCSessionDescriptionInit, username: string }`
  - Emits: `answer` to target peer.

- **ice_candidate**: Send ICE candidate for peer connection.
  - Payload: `{ to: string, candidate: RTCIceCandidateInit }`
  - Emits: `ice_candidate` to target peer.

- **disconnect**: Handle user disconnection.
  - Automatically removes user from online lists and emits `online_users` and `user_left_call`.

### Server → Client Events

- **receive_message**: Listen for incoming text messages.
  - Data: `{ username: string, message: string, type: string, createdAt: string }`

- **receive_voice_message**: Listen for incoming voice messages.
  - Data: `{ username: string, message: string, type: string, url: string, createdAt: string }`

- **receive_image_message**: Listen for incoming image messages.
  - Data: `{ username: string, message: string, type: string, url: string, createdAt: string }`

- **message_deleted**: Notification when a message is deleted.
  - Data: `{ messageId: string }`

- **online_users**: Listen for updates to online users in the room.
  - Data: Array of usernames (e.g., `["user1", "user2"]`)

- **user_joined_call**: Listen for users joining the call.
  - Data: `{ socketId: string, username: string }`

- **user_left_call**: Listen for users leaving the call.
  - Data: `{ socketId: string }`

- **call_notification**: Listen for call join notifications in chat.
  - Data: `{ username: string, message: string, type: string, callInitiator: string }`

- **call_ended_notification**: Listen for call leave notifications in chat.
  - Data: `{ username: string, message: string, type: string }`

- **offer**: Listen for WebRTC offers from peers.
  - Data: `{ from: string, offer: RTCSessionDescriptionInit, username: string }`

- **answer**: Listen for WebRTC answers from peers.
  - Data: `{ from: string, answer: RTCSessionDescriptionInit, username: string }`

- **ice_candidate**: Listen for ICE candidates from peers.
  - Data: `{ from: string, candidate: RTCIceCandidateInit }`

## Environment Variables

- `MONGO_URI`: MongoDB connection string (required)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)
- `PORT`: Server port (default: 5000)

## Project Structure

```
Chillout-backend-v2/
├── src/
│   ├── config/
│   │   ├── env.ts          # Environment configuration
│   │   └── gridfs.ts       # GridFS storage configuration for media files
│   ├── controllers/
│   │   ├── roomController.ts    # Room-related logic
│   │   ├── voiceController.ts   # Voice message retrieval logic
│   │   └── imageController.ts   # Image retrieval logic
│   ├── models/
│   │   └── Room.ts         # Mongoose schema for Room
│   ├── routes/
│   │   └── roomRoutes.ts   # Express routes
│   ├── server.ts           # Main server file
│   └── socket.ts           # Socket.IO setup and event handlers
├── dist/                   # Compiled JavaScript (generated)
├── .env                    # Environment variables (not in git)
├── package.json
├── tsconfig.json
└── README.md
```

## Database Schema

### Room Model

```typescript
{
  roomId: string,           // Unique room identifier
  messages: [
    {
      username: string,     // Message sender
      message: string,      // Message content
      type: string,         // 'text', 'voice', 'image', 'call_notification'
      url?: string,         // GridFS file URL (for voice/image)
      createdAt: Date,      // Message timestamp
      callInitiator?: string // Username who started call (for notifications)
    }
  ],
  lastActivity: Date,       // Last message timestamp (for TTL)
  createdAt: Date,
  updatedAt: Date
}
```

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Make your changes.
4. Commit changes: `git commit -m 'Add your feature'`.
5. Push to the branch: `git push origin feature/your-feature`.
6. Submit a pull request.

## License

ISC

## Deployment

The backend is deployed on Render at: `https://chillout-backend-v2.onrender.com`

For deployment:
1. Ensure all environment variables are set in your hosting platform
2. Run `npm run build` to compile TypeScript
3. Use `npm start` to run the production server
