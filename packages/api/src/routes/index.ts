import { Router } from "express";
import type { IRouter } from "express";
import { uploadFile } from "../controllers/upload-file";
import { uploadText } from "../controllers/upload-text";
import { getEmbeddings } from "../controllers/embeddings";
import { userFiles } from "../controllers/user-files";
import { upload } from "../middleware/upload";
import { apiKeyAuth } from "../middleware/auth";

export const router: IRouter = Router();

router.use(apiKeyAuth());

router.post("/upload_file", upload.single("file"), uploadFile);
router.post("/upload_text", uploadText);
router.post("/embeddings", getEmbeddings);
router.post("/user_files", userFiles);
