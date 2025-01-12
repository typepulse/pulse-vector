import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { NextFunction, Request, Response } from "express";
import type { Database } from "@supavec/web/src/types/supabase";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const requestSchema = z.object({
  file_id: z.string().uuid(),
});

export const validateRequestMiddleware = () => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const validation = requestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid request parameters",
          details: validation.error.errors,
        });
      }

      const { file_id } = validation.data;
      const apiKey = req.headers.authorization as string;

      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from("api_keys")
        .select("team_id")
        .match({ api_key: apiKey })
        .single();

      if (apiKeyError || !apiKeyData?.team_id) {
        return res.status(401).json({
          success: false,
          message: "Invalid API key",
        });
      }

      req.body.validatedData = { file_id, teamId: apiKeyData.team_id };
      return next();
    } catch (error) {
      console.error("Error validating request:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to validate request",
      });
    }
  };
};
