import { NextFunction, Request, Response } from "express";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export const rateLimit = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? req.socket?.remoteAddress;
    console.log({ ip });

    const identifier = ip;
    const { success } = await ratelimit.limit(identifier ?? "fdsdsa");

    if (!success) {
      return res.status(429).json({
        success: false,
        error: "Too many requests",
      });
    }

    return next();
  };
};
