import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { Request, Response } from "express";
import { OpenAIEmbeddings } from "@langchain/openai";

type EmbeddingsRequest = {
  query: string;
  k: number;
  include_vectors?: boolean;
  include_raw_file?: boolean;
  file_ids?: string[];
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const getEmbeddings = async (req: Request, res: Response) => {
  try {
    const {
      query,
      k = 3,
      include_vectors = false,
      include_raw_file = false,
      file_ids,
    } = req.body as EmbeddingsRequest;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required",
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

    const results = await vectorStore.similaritySearchWithScore(query, k);

    const mockResponse = {
      success: true,
      documents: results[0].filter((result) => typeof result !== "number").map(
        (r) => {
          return {
            file_id: r.metadata.file_id,
            content: r.pageContent,
          };
        },
      ),
    };

    return res.status(200).json(mockResponse);
  } catch (error) {
    console.error("Error in embeddings endpoint:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
