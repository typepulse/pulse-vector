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

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const processPdf = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

    const buffer = req.file.buffer;

    // Create a temporary file path
    const tempFileName = `${randomUUID()}.pdf`;
    const tempFilePath = join(tmpdir(), tempFileName);
    await writeFile(tempFilePath, buffer);

    // Upload to Supabase Storage
    const uploadId = randomUUID();
    const { error } = await supabase.storage.createBucket(uploadId, {
      public: false,
    });

    if (error) {
      console.error("Error creating bucket:", error);
      await unlink(tempFilePath);
      throw new Error(error.message);
    }

    const fileName = `${uploadId}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage.from(uploadId)
      .upload(fileName, buffer);

    if (uploadError) {
      await unlink(tempFilePath);
      return res.status(500).json({ error: uploadError.message });
    }

    // Load and process PDF with LangChain
    const loader = new PDFLoader(tempFilePath);
    const pages = await loader.load();

    // Clean up temp file
    await unlink(tempFilePath);

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.splitDocuments(pages);

    // Create embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    try {
      await SupabaseVectorStore.fromDocuments(chunks, embeddings, {
        client: supabase,
        tableName: "vectors",
        queryName: "match_vectors",
      });

      res.json({
        message: "PDF processed successfully",
        fileName: uploadData.path,
        chunks: chunks.length,
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
      error: `Failed to process PDF${
        error instanceof Error ? `: ${error.message}` : ""
      }`,
    });
  }
};
