import { PostHog } from "posthog-node";

// Initialize PostHog client
export const client = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST!,
});
