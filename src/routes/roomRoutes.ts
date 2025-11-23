import { Router } from "express";
import { createOrGetRoom, uploadVoice, uploadImage } from "../controllers/roomController";
import { getVoiceFile } from "../controllers/voiceController";
import { getImageFile } from "../controllers/imageController";
import { createGridFsStorage, createImageGridFsStorage } from "../config/gridfs";
import multer from "multer";

const router = Router();

// Configure multer for voice file uploads using GridFS
const upload = multer({ storage: createGridFsStorage() });
const uploadImageMulter = multer({ storage: createImageGridFsStorage() });

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
router.post("/room/:roomId/image", uploadImageMulter.single("image"), uploadImage);
router.get("/voice/:fileId", getVoiceFile);
router.get("/image/:fileId", getImageFile);

export default router;
