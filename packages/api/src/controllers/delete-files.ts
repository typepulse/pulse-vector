import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@supavec/web/src/types/supabase";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const requestSchema = z.object({
  file_ids: z.array(z.string().uuid()).min(
    1,
    "At least one file ID is required",
  ),
});

export const deleteFiles = async (req: Request, res: Response) => {
  try {
    const validation = requestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request parameters",
        details: validation.error.errors,
      });
    }

    const { file_ids } = validation.data;

    // Get team ID from API key
    const apiKey = req.headers.authorization as string;
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("team_id")
      .match({ api_key: apiKey })
      .single();

    if (apiKeyError || !apiKeyData?.team_id) {
      return res.status(401).json({
        success: false,
        error: "Invalid API key",
      });
    }

    const teamId = apiKeyData.team_id;

    // Get files data to verify ownership and get storage paths
    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("file_id, storage_path")
      .in("file_id", file_ids)
      .match({ team_id: teamId })
      .is("deleted_at", null);

    if (filesError) {
      throw new Error(`Failed to fetch files: ${filesError.message}`);
    }

    if (!files.length) {
      return res.status(404).json({
        success: false,
        error: "No files found with the provided IDs for this team",
      });
    }

    const foundFileIds = files.map((file) => file.file_id as string);
    const storagePaths = files
      .map((file) => file.storage_path)
      .filter((path): path is string => path !== null);

    // Delete files from storage
    const storageErrors: string[] = [];
    for (const path of storagePaths) {
      const { error: storageError } = await supabase.storage
        .from("user-documents")
        .remove([path]);

      if (storageError) {
        storageErrors.push(`Failed to delete ${path}: ${storageError.message}`);
      }
    }

    // Soft delete records in files and documents tables
    const now = new Date().toISOString();

    // Update files table with deleted_at
    const { error: filesUpdateError } = await supabase
      .from("files")
      .update({ deleted_at: now })
      .in("file_id", foundFileIds);

    if (filesUpdateError) {
      throw new Error(`Failed to update files: ${filesUpdateError.message}`);
    }

    // Update documents table with deleted_at
    const { error: documentsUpdateError } = await supabase
      .from("documents")
      .update({ deleted_at: now })
      .filter(
        "metadata->>'file_id'",
        "in",
        `(${foundFileIds.map((id) => `'${id}'`).join(",")})`,
      );

    if (documentsUpdateError) {
      throw new Error(
        `Failed to update documents: ${documentsUpdateError.message}`,
      );
    }

    return res.json({
      success: true,
      message: "Files marked as deleted successfully",
      deleted_file_ids: foundFileIds,
      storage_errors: storageErrors.length > 0 ? storageErrors : undefined,
    });
  } catch (error) {
    console.error("Error deleting files:", error);
    return res.status(500).json({
      success: false,
      error: `Failed to delete files${
        error instanceof Error ? `: ${error.message}` : ""
      }`,
    });
  }
};
