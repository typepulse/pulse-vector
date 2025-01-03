import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@supavec/web/src/types/supabase";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const userFiles = async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers.authorization as string;

    // Get team ID from API key
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

    // Fetch files for the team
    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("*")
      .match({ team_id: teamId })
      .order("created_at", { ascending: false });

    if (filesError) {
      throw new Error(`Failed to fetch files: ${filesError.message}`);
    }

    return res.status(200).json({
      success: true,
      files: files.map((file) => ({
        file_id: file.file_id,
        file_name: file.file_name,
        type: file.type,
        created_at: file.created_at,
      })),
    });
  } catch (error) {
    console.error("Error listing files:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to list files",
    });
  }
};
