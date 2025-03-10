import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// import { client } from "@/utils/posthog";
import { logApiUsageAsync } from "@/utils/async-logger";
import { supabaseAdmin } from "@/utils/supabase/admin";

console.log("[USER-FILES] Module loaded");

const requestSchema = z.object({
  pagination: z
    .object({
      limit: z.number().positive().default(10),
      offset: z.number().nonnegative().default(0),
    })
    .default({ limit: 10, offset: 0 }),
  order_dir: z.enum(["asc", "desc"]).default("desc"),
});

export async function POST(request: NextRequest) {
  console.log("[USER-FILES] Request received");
  try {
    const body = await request.json();
    console.log("[USER-FILES] Request body", { body });

    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      console.log("[USER-FILES] Validation failed", validation.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request parameters",
          details: validation.error.errors,
        },
        { status: 400 },
      );
    }

    const { pagination, order_dir } = validation.data;
    console.log("[USER-FILES] Validated request data", {
      pagination,
      order_dir,
    });

    // Get team ID from API key
    const apiKey = request.headers.get("authorization");
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "No API key provided" },
        { status: 401 },
      );
    }

    console.log("[USER-FILES] Verifying API key");
    const supabase = supabaseAdmin;
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("team_id, user_id, profiles(email)")
      .match({ api_key: apiKey })
      .single();

    if (apiKeyError || !apiKeyData?.team_id) {
      console.log("[USER-FILES] Invalid API key", { error: apiKeyError });
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 },
      );
    }

    const teamId = apiKeyData.team_id;
    console.log("[USER-FILES] Team ID retrieved", { teamId });

    // Fetch files with pagination
    console.log("[USER-FILES] Fetching files with pagination");
    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("type, file_id, created_at, file_name, team_id")
      .match({ team_id: teamId })
      .is("deleted_at", null)
      .range(pagination.offset, pagination.offset + pagination.limit - 1)
      .order("created_at", { ascending: order_dir === "asc" });

    if (filesError) {
      console.log("[USER-FILES] Error fetching files", { error: filesError });
      throw new Error(`Failed to fetch files: ${filesError.message}`);
    }
    console.log("[USER-FILES] Files fetched successfully", {
      count: files?.length,
    });

    // Get total count for pagination
    console.log("[USER-FILES] Getting total count");
    const { count, error: countError } = await supabase
      .from("files")
      .select("id", {
        count: "exact",
        head: true,
      })
      .match({ team_id: teamId })
      .is("deleted_at", null);

    if (countError) {
      console.log("[USER-FILES] Error getting count", { error: countError });
      throw new Error(`Failed to get total count: ${countError.message}`);
    }
    console.log("[USER-FILES] Total count retrieved", { count });

    // console.log("[USER-FILES] Capturing PostHog event");
    // client.capture({
    //   distinctId: apiKeyData.profiles?.email as string,
    //   event: "/user-files API Call",
    // });

    console.log("[USER-FILES] Logging API usage");
    logApiUsageAsync({
      endpoint: "/user-files",
      userId: apiKeyData.user_id || "",
      success: true,
    });

    console.log("[USER-FILES] Sending successful response");
    return NextResponse.json({
      success: true,
      results: files,
      pagination: {
        ...pagination,
      },
      count,
    });
  } catch (error) {
    console.error("[USER-FILES] Error fetching user files:", error);

    // Log error if we have user information
    if (error instanceof Error) {
      const apiKey = request.headers.get("authorization");
      if (apiKey) {
        console.log("[USER-FILES] Attempting to log error with user ID");
        const { data: apiKeyData } = await supabaseAdmin
          .from("api_keys")
          .select("user_id")
          .match({ api_key: apiKey })
          .single();

        if (apiKeyData?.user_id) {
          logApiUsageAsync({
            endpoint: "/user-files",
            userId: apiKeyData.user_id,
            success: false,
            error: error.message,
          });
          console.log("[USER-FILES] Error logged for user", {
            userId: apiKeyData.user_id,
          });
        }
      }
    }

    const message = error instanceof Error
      ? error.message
      : "Failed to fetch files";
    console.log("[USER-FILES] Sending error response");
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
