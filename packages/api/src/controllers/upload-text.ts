import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { z } from "zod";

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const uploadTextSchema = z.object({
  contents: z.string().min(5),
  name: z.string().min(1).optional().default("Untitled Document"),
  chunk_size: z.number().positive().optional(),
  chunk_overlap: z.number().positive().optional(),
});

export const uploadText = async (req: Request, res: Response) => {
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

    const teamId = apiKeyData.team_id as string;

    // Validate body parameters
    const bodyValidation = uploadTextSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request body",
      });
    }

    const {
      contents,
      name,
      chunk_size = DEFAULT_CHUNK_SIZE,
      chunk_overlap = DEFAULT_CHUNK_OVERLAP,
    } = bodyValidation.data;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunk_size,
      chunkOverlap: chunk_overlap,
    });

    const docs = await splitter.createDocuments([contents], [{ source: name }]);

    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
      model: "text-embedding-3-small",
    });

    await SupabaseVectorStore.fromDocuments(docs, embeddings, {
      client: supabase,
      tableName: "documents",
    });

    return res.status(200).json({
      success: true,
      message: "Text uploaded and processed successfully",
    });
  } catch (error) {
    console.error("Error processing text upload:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process text upload",
    });
  }
};
