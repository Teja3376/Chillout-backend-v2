import { Router } from "express";
import { createOrGetRoom } from "../controllers/roomController";

const router = Router();

router.get("/room/:roomId", createOrGetRoom);

export default router;
