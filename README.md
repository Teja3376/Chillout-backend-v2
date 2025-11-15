# Chillout Backend v2

## Description

Chillout Backend v2 is a Node.js-based backend service for a real-time chat application. It provides RESTful API endpoints for managing chat rooms and integrates Socket.IO for real-time messaging and user presence tracking. The application uses MongoDB as the database to store room data and messages.

## Features

- Create or retrieve chat rooms by room ID
- Real-time messaging within rooms (text and voice)
- Voice message upload and retrieval using MongoDB GridFS
- Track online users per room
- CORS support for cross-origin requests
- Environment-based configuration

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.IO
- **Other Libraries**:
  - `cors`: For handling Cross-Origin Resource Sharing
  - `dotenv`: For environment variable management
- **Development Tools**:
  - `nodemon`: For automatic server restarts during development
  - `ts-node`: For running TypeScript directly
  - `typescript`: For TypeScript compilation
  - `@types/express` and `@types/node`: Type definitions

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/Teja3376/Chillout-backend-v2.git
   cd Chillout-backend-v2
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   MONGO_URI=your_mongodb_connection_string
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   ```

4. Start the development server:

   ```
   npm run dev
   ```

5. For production, build and start:
   ```
   npm run build
   npm start
   ```

## Usage

The server will run on `http://localhost:PORT` (default 5000). It connects to MongoDB and initializes Socket.IO for real-time features.

## API Endpoints

### GET /api/room/:roomId

Retrieves or creates a room with the specified `roomId`.

- **Parameters**:

  - `roomId` (string): The unique identifier for the room.

- **Response**:
  - Status: 200 OK
  - Body: JSON object representing the room, including `roomId` and `messages` array.

Example:

```
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

### POST /api/room/:roomId/voice

Uploads a voice message file to the specified room.

- **Parameters**:

  - `roomId` (string): The unique identifier for the room.
  - `voice` (file): The voice message file (multipart/form-data).
  - `username` (string): The username of the sender.

- **Response**:
  - Status: 200 OK
  - Body: JSON object with the URL to access the uploaded voice file.

Example:

```
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

### GET /api/voice/:fileId

Retrieves a voice message file by its GridFS file ID.

- **Parameters**:

  - `fileId` (string): The MongoDB ObjectId of the voice file.

- **Response**:
  - Status: 200 OK
  - Body: The voice file data (audio/webm).

## Socket.IO Events

The backend uses Socket.IO for real-time communication. Connect to the server using a Socket.IO client.

### Events

- **join_room**: Join a room and notify others.

  - Payload: `{ roomId: string, username: string }`
  - Emits: `online_users` to all in room with updated list.

- **send_message**: Send a text message to a room.

  - Payload: `{ roomId: string, username: string, message: string }`
  - Emits: `receive_message` to all in room with message data.

- **send_voice_message**: Send a voice message to a room.

  - Payload: `{ roomId: string, username: string, url: string }`
  - Emits: `receive_voice_message` to all in room with message data.

- **disconnect**: Handle user disconnection.
  - Automatically removes user from online lists and emits `online_users`.

### Listening Events

- **receive_message**: Listen for incoming text messages.

  - Data: `{ username: string, message: string, type: string }`

- **receive_voice_message**: Listen for incoming voice messages.

  - Data: `{ username: string, message: string, type: string, url: string }`

- **online_users**: Listen for updates to online users in the room.
  - Data: Array of usernames (e.g., `["user1", "user2"]`)

## Environment Variables

- `MONGO_URI`: MongoDB connection string (required)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)
- `PORT`: Server port (default: 5000)

## Project Structure

```
src/
├── config/
│   ├── env.ts          # Environment configuration
│   └── gridfs.ts       # GridFS storage configuration for voice messages
├── controllers/
│   ├── roomController.ts  # Room-related logic
│   └── voiceController.ts # Voice message retrieval logic
├── models/
│   └── Room.ts         # Mongoose schema for Room
├── routes/
│   └── roomRoutes.ts   # Express routes
├── server.ts           # Main server file
└── socket.ts           # Socket.IO setup
```

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Submit a pull request.

## License

ISC
