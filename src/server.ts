import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import roomRoutes from "./routes/roomRoutes";
import { initSocket } from "./socket";
import { MONGO_URI, PORT, FRONTEND_URL } from "./config/env";

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
app.use("/api", roomRoutes);

mongoose.connect(MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
