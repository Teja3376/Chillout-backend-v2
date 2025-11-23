import { Request, Response } from "express";
import mongoose from "mongoose";

export const getImageFile = async (req: Request, res: Response) => {
  const { fileId } = req.params;

  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res
        .status(500)
        .json({ error: "Database connection not available" });
    }

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "images",
    });

    const downloadStream = bucket.openDownloadStream(
      new mongoose.Types.ObjectId(fileId)
    );

    downloadStream.on("error", (error) => {
      console.error("Error streaming file:", error);
      return res.status(404).json({ error: "File not found" });
    });

    downloadStream.on("file", (file) => {
      res.set("Content-Type", file.contentType || "image/jpeg");
      res.set("Content-Disposition", "inline");
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error retrieving image file:", error);
    return res.status(500).json({ error: "Failed to retrieve image file" });
  }
};
