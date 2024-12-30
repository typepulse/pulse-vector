import { Router } from "express";
import type { IRouter } from "express";
import { uploadFile } from "../controllers/upload-file";
import { getEmbeddings } from "../controllers/embeddings";
import { upload } from "../middleware/upload";

export const router: IRouter = Router();

router.post("/upload_file", upload.single("file"), uploadFile);
router.post("/embeddings", getEmbeddings);
