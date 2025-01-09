import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { Request, Response } from "express";
import { OpenAIEmbeddings } from "@langchain/openai";
import { z } from "zod";
import type { Database } from "@supavec/web/src/types/supabase";

const embeddingsSchema = z.object({
  query: z.string().min(1, "Query is required"),
  k: z.number().int().positive().default(3),
  include_vectors: z.boolean().optional(),
  include_raw_file: z.boolean().optional(),
  file_ids: z.array(z.string().uuid()).min(
    1,
    "At least one file ID is required",
  ),
});

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const getEmbeddings = async (req: Request, res: Response) => {
  try {
    const validationResult = embeddingsSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: validationResult.error.issues,
      });
    }

    const { query, k, file_ids } = validationResult.data;

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

    // Verify file ownership
    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("file_id")
      .in("file_id", file_ids)
      .match({ team_id: teamId });

    if (filesError) {
      throw new Error(`Failed to verify file ownership: ${filesError.message}`);
    }

    // Throw error if any file is not found or doesn't belong to the team
    if (!files || files.length !== file_ids.length) {
      return res.status(403).json({
        success: false,
        error: "One or more files do not belong to your team",
      });
    }

    const vectorStore = new SupabaseVectorStore(
      new OpenAIEmbeddings({
        modelName: "text-embedding-3-small",
        model: "text-embedding-3-small",
      }),
      {
        client: supabase,
        tableName: "documents",
        queryName: "match_documents",
        filter: file_ids ? { file_id: { in: file_ids } } : undefined,
      },
    );

    const similaritySearchWithScoreResults = await vectorStore
      .similaritySearchWithScore(query, k);
    const documentsResponse = [];
    for (const [doc, score] of similaritySearchWithScoreResults) {
      documentsResponse.push({
        content: doc.pageContent,
        file_id: doc.metadata.file_id,
        score: score.toFixed(3),
      });
    }

    const response = {
      success: true,
      documents: documentsResponse,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in embeddings endpoint:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
