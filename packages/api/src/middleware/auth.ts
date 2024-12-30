import { NextFunction, Request, Response } from "express";

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
}

export const apiKeyAuth = (
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

  req.apiKey = authHeader;
  return next();
};
