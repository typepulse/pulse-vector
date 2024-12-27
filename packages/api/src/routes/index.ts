import { Router } from "express";
import type { IRouter } from "express";
import { hello } from "../controllers/hello";
import { processPdf } from "../controllers/process-pdf";
import { upload } from "../middleware/upload";

export const router: IRouter = Router();

// Hello route
router.get("/hello", hello);

// PDF processing route
router.post("/process-pdf", upload.single("file"), processPdf);
