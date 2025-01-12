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

type ValidatedRequest = {
  file_id: string;
  teamId: string;
};

type CustomError = {
  status?: number;
  message: string;
  details?: z.ZodError["errors"];
};

async function validateRequest(req: Request): Promise<ValidatedRequest> {
  const validation = requestSchema.safeParse(req.body);
  if (!validation.success) {
    throw {
      status: 400,
      message: "Invalid request parameters",
      details: validation.error.errors,
    };
  }

  const { file_id } = validation.data;
  const apiKey = req.headers.authorization as string;

  const { data: apiKeyData, error: apiKeyError } = await supabase
    .from("api_keys")
    .select("team_id")
    .match({ api_key: apiKey })
    .single();

  if (apiKeyError || !apiKeyData?.team_id) {
    throw {
      status: 401,
      message: "Invalid API key",
    };
  }

  return { file_id, teamId: apiKeyData.team_id };
}

async function getFileData(fileId: string, teamId: string) {
  const { data: file, error: filesError } = await supabase
    .from("files")
    .select("file_id, storage_path")
    .match({ id: fileId, team_id: teamId })
    .is("deleted_at", null)
    .single();

  if (filesError) {
    throw new Error(`Failed to fetch file: ${filesError.message}`);
  }

  if (!file) {
    throw {
      status: 404,
      message: "No file found with the provided ID for this team",
    };
  }

  return file;
}

export const deleteFiles = async (req: Request, res: Response) => {
  try {
    const { file_id, teamId } = await validateRequest(req);
    const file = await getFileData(file_id, teamId);

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
  } catch (error: unknown) {
    console.error("Error deleting file:", error);
    const customError = error as CustomError;
    const status = customError.status || 500;
    const message = customError.message || "Failed to delete file";
    return res.status(status).json({
      success: false,
      error: message,
      ...(customError.details && { details: customError.details }),
    });
  }
};
