import { Request, Response } from "express";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { unlink, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { client } from "../utils/posthog";
import { logApiUsageAsync } from "../utils/async-logger";
import { supabase } from "../utils/supabase";

type ValidatedRequest = Request & {
  body: {
    validatedData: {
      file_id: string;
      chunk_size?: number;
      chunk_overlap?: number;
      teamId: string;
      apiKeyData: {
        user_id?: string;
        profiles?: {
          email?: string;
        };
        [key: string]: unknown;
      };
    };
  };
};

async function getFileData(fileId: string, teamId: string) {
  const { data: file, error: filesError } = await supabase
    .from("files")
    .select("file_id, storage_path, file_name, type")
    .match({ file_id: fileId, team_id: teamId })
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

export const resyncFile = async (req: ValidatedRequest, res: Response) => {
  try {
    const { file_id, chunk_size, chunk_overlap, teamId, apiKeyData } =
      req.body.validatedData;

    // Get file data from database
    const file = await getFileData(file_id, teamId);

    if (!file.storage_path) {
      throw new Error("File has no storage path");
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("user-documents")
      .download(file.storage_path);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Save file to temp directory
    const isTextFile = file.type === "text";
    const fileExtension = isTextFile ? "txt" : "pdf";
    const tempFileName = `${file_id}.${fileExtension}`;
    const tempFilePath = join(tmpdir(), tempFileName);
    await writeFile(tempFilePath, Buffer.from(await fileData.arrayBuffer()));

    // Process file content
    let documents: Document[];
    if (isTextFile) {
      // For text files, create a single document from the content
      const textContent = Buffer.from(await fileData.arrayBuffer()).toString(
        "utf-8",
      );
      documents = [
        new Document({
          pageContent: textContent,
          metadata: { source: tempFileName },
        }),
      ];
    } else {
      // For PDFs, use the PDFLoader
      const loader = new PDFLoader(tempFilePath);
      documents = await loader.load();
    }

    // Clean up temp file
    await unlink(tempFilePath);

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunk_size,
      chunkOverlap: chunk_overlap,
    });
    const chunks = await splitter.splitDocuments(documents);

    // Add file_id metadata to each chunk
    chunks.forEach((chunk) => {
      chunk.metadata.file_id = file_id;
      chunk.metadata.team_id = teamId;
    });

    // Soft delete existing embeddings
    const now = new Date().toISOString();
    const { error: documentsUpdateError } = await supabase
      .from("documents")
      .update({ deleted_at: now })
      .filter("metadata->>file_id", "eq", file_id);

    if (documentsUpdateError) {
      throw new Error(
        `Failed to update existing documents: ${documentsUpdateError.message}`,
      );
    }

    // Create new embeddings
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
      model: "text-embedding-3-small",
    });

    try {
      await SupabaseVectorStore.fromDocuments(chunks, embeddings, {
        client: supabase,
        tableName: "documents",
      });

      client.capture({
        distinctId: apiKeyData.profiles?.email as string,
        event: "/resync_file API Call",
        properties: {
          file_name: file.file_name,
          file_type: file.type,
          file_id: file_id,
        },
      });

      logApiUsageAsync({
        endpoint: "/resync_file",
        userId: apiKeyData.user_id || "",
        success: true,
      });

      return res.json({
        success: true,
        message: `File resynced successfully`,
        file_name: file.file_name,
        file_id: file_id,
        chunks: chunks.length,
        chunk_size,
        chunk_overlap,
      });
    } catch (vectorError) {
      throw new Error(
        vectorError instanceof Error
          ? vectorError.message
          : "Error processing vectors",
      );
    }
  } catch (error) {
    console.error("Error resyncing file:", error);

    if (req.headers.authorization) {
      const apiKey = req.headers.authorization as string;
      const { data: apiKeyData } = await supabase
        .from("api_keys")
        .select("user_id")
        .match({ api_key: apiKey })
        .single();

      if (apiKeyData?.user_id) {
        logApiUsageAsync({
          endpoint: "/resync_file",
          userId: apiKeyData.user_id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const customError = error as Error & { status?: number };
    const status = customError.status || 500;
    const message = customError.message || "Failed to resync file";

    return res.status(status).json({
      success: false,
      error: message,
    });
  }
};
