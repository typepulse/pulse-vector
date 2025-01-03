import multer from "multer";
import { Request } from "express";

// Configure multer for memory storage
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "text/plain"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and text files are allowed"));
    }
  },
});
