import { createClient } from "@supabase/supabase-js";
import { NextFunction, Request, Response } from "express";
import { Database } from "@supavec/web/src/types/supabase";

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
}

export const apiKeyAuth = () => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: "error",
        message: "Missing API key in authorization header",
      });
    }

    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data, error } = await supabase.from("api_keys").select("*").match({
      api_key: authHeader,
    })
      .single();

    if (error || !data) {
      return res.status(401).json({
        status: "error",
        message: "Invalid API key",
      });
    }

    req.apiKey = authHeader;
    return next();
  };
};
