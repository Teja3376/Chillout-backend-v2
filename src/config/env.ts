import dotenv from "dotenv";
dotenv.config();

export const MONGO_URI = process.env.MONGO_URI 
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
export const PORT = process.env.PORT || 5000;
