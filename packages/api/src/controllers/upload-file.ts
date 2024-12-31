import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { unlink, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { z } from "zod";

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const uploadQuerySchema = z.object({
  chunk_size: z.coerce.number().positive().nullish(),
  chunk_overlap: z.coerce.number().positive().nullish(),
});

export const uploadFile = async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const queryValidation = uploadQuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: queryValidation.error.errors,
      });
    }
    const { chunk_size, chunk_overlap } = queryValidation.data;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No PDF file provided",
      });
    }

    const buffer = req.file.buffer;

    // Create a temporary file path
    const tempFileName = `${randomUUID()}.pdf`;
    const tempFilePath = join(tmpdir(), tempFileName);
    await writeFile(tempFilePath, buffer);

    // Upload to Supabase Storage
    const uploadId = randomUUID();
    const fileName = `${uploadId}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage.from("users_files/")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      await unlink(tempFilePath);
      return res.status(500).json({
        success: false,
        error: uploadError.message,
      });
    }

    const loader = new PDFLoader(tempFilePath);
    const pages = await loader.load();

    // Clean up temp file
    await unlink(tempFilePath);

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunk_size ?? DEFAULT_CHUNK_SIZE,
      chunkOverlap: chunk_overlap ?? DEFAULT_CHUNK_OVERLAP,
    });
    const chunks = await splitter.splitDocuments(pages);

    // Add file_id metadata to each chunk
    chunks.forEach((chunk) => {
      chunk.metadata.file_id = uploadId;
    });

    // Create embeddings
    const embeddings = new OpenAIEmbeddings();

    try {
      await SupabaseVectorStore.fromDocuments(chunks, embeddings, {
        client: supabase,
        tableName: "documents",
      });

      res.json({
        success: true,
        message: "PDF processed successfully",
        fileName: uploadData.path,
        file_id: uploadId,
        chunks: chunks.length,
        chunk_size: chunk_size ?? DEFAULT_CHUNK_SIZE,
        chunk_overlap: chunk_overlap ?? DEFAULT_CHUNK_OVERLAP,
      });
    } catch (vectorError) {
      throw new Error(
        vectorError instanceof Error
          ? vectorError.message
          : "Error processing vectors",
      );
    }
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({
      success: false,
      error: `Failed to process PDF${
        error instanceof Error ? `: ${error.message}` : ""
      }`,
    });
  }
};
