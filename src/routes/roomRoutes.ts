import { Router } from "express";
import { createOrGetRoom, uploadVoice } from "../controllers/roomController";
import { getVoiceFile } from "../controllers/voiceController";
import { createGridFsStorage } from "../config/gridfs";
import multer from "multer";

const router = Router();

// Configure multer for voice file uploads using GridFS
const upload = multer({ storage: createGridFsStorage() });

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

router.get("/room/:roomId", createOrGetRoom);
router.post("/room/:roomId/voice", upload.single("voice"), uploadVoice);
router.get("/voice/:fileId", getVoiceFile);

export default router;
