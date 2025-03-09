import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// import { client } from "@/utils/posthog";
import { logApiUsageAsync } from "@/utils/async-logger";
import { supabaseAdmin } from "@/utils/supabase/admin";

console.log("[DELETE-FILE] Module loaded");

const deleteFileSchema = z.object({
  file_id: z.string(),
});

async function getFileData(fileId: string, teamId: string) {
  console.log("[DELETE-FILE] Fetching file data", { fileId, teamId });
  const supabase = supabaseAdmin;
  const { data: file, error: filesError } = await supabase
    .from("files")
    .select("file_id, storage_path")
    .match({ file_id: fileId, team_id: teamId })
    .is("deleted_at", null)
    .single();

  if (filesError) {
    console.log("[DELETE-FILE] Error fetching file data", {
      error: filesError,
    });
    throw new Error(`Failed to fetch file: ${filesError.message}`);
  }

  if (!file) {
    console.log("[DELETE-FILE] No file found");
    throw {
      status: 404,
      message: "No file found with the provided ID for this team",
    };
  }

  console.log("[DELETE-FILE] File data retrieved", { fileId: file.file_id });
  return file;
}

export async function DELETE(request: NextRequest) {
  console.log("[DELETE-FILE] Request received");
  try {
    const apiKey = request.headers.get("authorization");
    console.log("[DELETE-FILE] API key", { apiKey });
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "No API key provided" },
        { status: 401 },
      );
    }

    const supabase = supabaseAdmin;
    // Get team ID from API key
    console.log("[DELETE-FILE] Verifying API key");
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("team_id, user_id, profiles(email)")
      .match({ api_key: apiKey })
      .single();

    if (apiKeyError || !apiKeyData?.team_id) {
      console.log("[DELETE-FILE] Invalid API key", { error: apiKeyError });
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = deleteFileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { file_id } = validationResult.data;
    const teamId = apiKeyData.team_id;

    console.log("[DELETE-FILE] Processing request with validated data", {
      file_id,
      teamId,
    });

    const file = await getFileData(file_id, teamId);

    // Delete file from storage if storage path exists
    let storageError: string | undefined;
    if (file.storage_path) {
      console.log("[DELETE-FILE] Deleting file from storage", {
        path: file.storage_path,
      });
      const { error: deleteError } = await supabase.storage
        .from("user_documents")
        .remove([file.storage_path]);

      if (deleteError) {
        console.log("[DELETE-FILE] Error deleting from storage", {
          error: deleteError,
        });
        storageError =
          `Failed to delete ${file.storage_path}: ${deleteError.message}`;
      } else {
        console.log("[DELETE-FILE] File deleted from storage");
      }
    }

    // Soft delete records in files and documents tables
    const now = new Date().toISOString();

    // Update files table with deleted_at
    console.log("[DELETE-FILE] Soft deleting file record");
    const { error: filesUpdateError } = await supabase
      .from("files")
      .update({ deleted_at: now })
      .match({ file_id });

    if (filesUpdateError) {
      console.log("[DELETE-FILE] Error updating file record", {
        error: filesUpdateError,
      });
      throw new Error(`Failed to update file: ${filesUpdateError.message}`);
    }
    console.log("[DELETE-FILE] File record marked as deleted");

    // Update documents table with deleted_at
    console.log("[DELETE-FILE] Soft deleting document records");

    // Add retry logic for document update
    let documentsUpdateError = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const { error } = await supabase
          .from("documents")
          .update({ deleted_at: now })
          .filter("metadata->>file_id", "eq", file_id);

        if (!error) {
          console.log(
            "[DELETE-FILE] Document records marked as deleted successfully",
          );
          documentsUpdateError = null;
          break;
        }

        documentsUpdateError = error;
        retryCount++;

        if (retryCount < maxRetries) {
          const backoffTime = Math.pow(2, retryCount) * 500; // Exponential backoff: 1s, 2s, 4s
          console.log(
            `[DELETE-FILE] Retry ${retryCount}/${maxRetries} after ${backoffTime}ms due to error:`,
            error,
          );
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
      } catch (err) {
        documentsUpdateError = err;
        retryCount++;

        if (retryCount < maxRetries) {
          const backoffTime = Math.pow(2, retryCount) * 500;
          console.log(
            `[DELETE-FILE] Retry ${retryCount}/${maxRetries} after ${backoffTime}ms due to exception:`,
            err,
          );
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
      }
    }

    if (documentsUpdateError) {
      console.log(
        "[DELETE-FILE] Error updating document records after all retries",
        {
          error: documentsUpdateError,
        },
      );
      throw new Error(
        `Failed to update documents after ${maxRetries} attempts: ${
          documentsUpdateError instanceof Error
            ? documentsUpdateError.message
            : JSON.stringify(documentsUpdateError)
        }`,
      );
    }

    // console.log("[DELETE-FILE] Capturing PostHog event");
    // client.capture({
    //   distinctId: apiKeyData.profiles?.email as string,
    //   event: "/delete_file API Call",
    // });

    console.log("[DELETE-FILE] Logging API usage");
    logApiUsageAsync({
      endpoint: "/delete_file",
      userId: apiKeyData.user_id || "",
      success: true,
    });

    console.log("[DELETE-FILE] Sending successful response");
    return NextResponse.json({
      success: true,
      message: "File marked as deleted successfully",
      deleted_file_id: file_id,
      storage_error: storageError,
    });
  } catch (error: unknown) {
    console.error("[DELETE-FILE] Error deleting file:", error);

    // Log error if we have user information
    if (error instanceof Error) {
      const apiKey = request.headers.get("authorization");
      if (apiKey) {
        console.log("[DELETE-FILE] Attempting to log error with user ID");
        const { data: apiKeyData } = await supabaseAdmin
          .from("api_keys")
          .select("user_id")
          .match({ api_key: apiKey })
          .single();

        if (apiKeyData?.user_id) {
          logApiUsageAsync({
            endpoint: "/delete_file",
            userId: apiKeyData.user_id,
            success: false,
            error: error.message,
          });
          console.log("[DELETE-FILE] Error logged for user", {
            userId: apiKeyData.user_id,
          });
        }
      }
    }

    const message = error instanceof Error
      ? error.message
      : "Failed to delete file";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any)?.status || 500;
    console.log("[DELETE-FILE] Sending error response", { message, status });
    return NextResponse.json(
      { success: false, error: message },
      { status },
    );
  }
}
