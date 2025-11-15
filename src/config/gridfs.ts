import mongoose from "mongoose";
import multer from "multer";
import { MONGO_URI } from "./env";

// Custom GridFS storage engine for multer
class GridFsStorage {
  private bucketName: string;

  constructor(options: { bucketName: string }) {
    this.bucketName = options.bucketName;
  }

  _handleFile(req: any, file: any, cb: (error?: any, info?: any) => void) {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db!, {
      bucketName: this.bucketName,
    });

    const filename = `voice-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}.webm`;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype,
    });

    file.stream.pipe(uploadStream);

    uploadStream.on("error", (error: any) => {
      cb(error);
    });

    uploadStream.on("finish", () => {
      cb(null, {
        filename: filename,
        id: uploadStream.id,
        size: uploadStream.length,
        bucketName: this.bucketName,
      });
    });
  }

  _removeFile(req: any, file: any, cb: (error?: any) => void) {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db!, {
      bucketName: this.bucketName,
    });

    bucket
      .delete(file.id)
      .then(() => cb())
      .catch(cb);
  }
}

// Initialize GridFS storage for multer
export const createGridFsStorage = () => {
  return new (GridFsStorage as any)({ bucketName: "voices" });
};
