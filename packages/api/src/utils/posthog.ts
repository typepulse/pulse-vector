import { PostHog } from "posthog-node";

if (!process.env.POSTHOG_API_KEY) {
  throw new Error("POSTHOG_API_KEY is required");
}

if (!process.env.POSTHOG_HOST) {
  throw new Error("POSTHOG_HOST is required");
}

// Initialize PostHog client
export const client = new PostHog(process.env.POSTHOG_API_KEY, {
  host: process.env.POSTHOG_HOST,
});
