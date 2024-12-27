import { Router } from "express";
import type { IRouter } from "express";
import { processPdf } from "../controllers/process-pdf";
import { upload } from "../middleware/upload";

export const router: IRouter = Router();

// PDF processing route
router.post("/process-pdf", upload.single("file"), processPdf);
