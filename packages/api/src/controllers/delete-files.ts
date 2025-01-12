import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@supavec/web/src/types/supabase";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const requestSchema = z.object({
  file_id: z.string().uuid(),
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

    const { file_id } = validation.data;

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

    // Get file data to verify ownership and get storage path
    const { data: file, error: filesError } = await supabase
      .from("files")
      .select("file_id, storage_path")
      .match({ id: file_id, team_id: teamId })
      .is("deleted_at", null)
      .single();

    if (filesError) {
      throw new Error(`Failed to fetch file: ${filesError.message}`);
    }

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "No file found with the provided ID for this team",
      });
    }

    // Delete file from storage if storage path exists
    let storageError: string | undefined;
    if (file.storage_path) {
      const { error: deleteError } = await supabase.storage
        .from("user-documents")
        .remove([file.storage_path]);

      if (deleteError) {
        storageError =
          `Failed to delete ${file.storage_path}: ${deleteError.message}`;
      }
    }

    // Soft delete records in files and documents tables
    const now = new Date().toISOString();

    // Update files table with deleted_at
    const { error: filesUpdateError } = await supabase
      .from("files")
      .update({ deleted_at: now })
      .match({ id: file_id });

    if (filesUpdateError) {
      throw new Error(`Failed to update file: ${filesUpdateError.message}`);
    }

    // Update documents table with deleted_at
    const { error: documentsUpdateError } = await supabase
      .from("documents")
      .update({ deleted_at: now })
      .filter("metadata->>'file_id'", "eq", file_id);

    if (documentsUpdateError) {
      throw new Error(
        `Failed to update documents: ${documentsUpdateError.message}`,
      );
    }

    return res.json({
      success: true,
      message: "File marked as deleted successfully",
      deleted_file_id: file_id,
      storage_error: storageError,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({
      success: false,
      error: `Failed to delete file${
        error instanceof Error ? `: ${error.message}` : ""
      }`,
    });
  }
};
