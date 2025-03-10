import { NextRequest, NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { unlink, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { z } from "zod";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { updateLoopsContact } from "@/utils/loops";
// import { client } from "@/utils/posthog";
import { logApiUsageAsync } from "@/utils/async-logger";
import { supabaseAdmin } from "@/utils/supabase/admin";

console.log("[UPLOAD-FILE] Module loaded");

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

const uploadQuerySchema = z.object({
  chunk_size: z.coerce.number().positive().nullish(),
  chunk_overlap: z.coerce.number().positive().nullish(),
});

export async function POST(request: NextRequest) {
  console.log("[UPLOAD-FILE] Request received");
  try {
    const apiKey = request.headers.get("authorization");
    console.log("[UPLOAD-FILE] API key", { apiKey });
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "No API key provided" },
        { status: 401 },
      );
    }

    // Get team ID from API key
    console.log("[UPLOAD-FILE] Verifying API key");
    const { data: apiKeyData, error: apiKeyError } = await supabaseAdmin
      .from("api_keys")
      .select("team_id, user_id, profiles(email)")
      .match({ api_key: apiKey })
      .single();

    if (apiKeyError || !apiKeyData?.team_id) {
      console.log("[UPLOAD-FILE] Invalid API key", { error: apiKeyError });
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 },
      );
    }

    const teamId = apiKeyData.team_id as string;
    console.log("[UPLOAD-FILE] Team ID retrieved", { teamId });

    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("[UPLOAD-FILE] No file provided in request");
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    // Validate query parameters from URL
    const url = new URL(request.url);
    const queryValidation = uploadQuerySchema.safeParse({
      chunk_size: url.searchParams.get("chunk_size"),
      chunk_overlap: url.searchParams.get("chunk_overlap"),
    });

    if (!queryValidation.success) {
      console.log(
        "[UPLOAD-FILE] Query validation failed",
        queryValidation.error.errors,
      );
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: queryValidation.error.errors,
        },
        { status: 400 },
      );
    }

    const { chunk_size, chunk_overlap } = queryValidation.data;
    console.log("[UPLOAD-FILE] Query parameters validated", {
      chunk_size,
      chunk_overlap,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = randomUUID();
    const isTextFile = file.type === "text/plain";
    const fileExtension = isTextFile ? "txt" : "pdf";
    const fileName = file.name;
    const tempFileName = `${fileId}.${fileExtension}`;
    const tempFilePath = join(tmpdir(), tempFileName);
    console.log("[UPLOAD-FILE] File details", {
      fileId,
      fileName,
      fileType: isTextFile ? "text" : "pdf",
      fileSize: buffer.length,
    });

    console.log("[UPLOAD-FILE] Writing file to temp location", {
      tempFilePath,
    });
    await writeFile(tempFilePath, buffer);

    // Upload file to Supabase Storage with team ID in path
    console.log("[UPLOAD-FILE] Uploading to Supabase Storage");
    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from("user_documents")
      .upload(`/${teamId}/${tempFileName}`, buffer, {
        contentType: isTextFile ? "text/plain" : "application/pdf",
        upsert: false,
      });

    if (storageError) {
      console.log("[UPLOAD-FILE] Storage upload failed", {
        error: storageError,
      });
      throw new Error(
        `Failed to upload file to storage: ${storageError.message}`,
      );
    }
    console.log("[UPLOAD-FILE] Storage upload successful", {
      path: storageData.path,
    });

    console.log("[UPLOAD-FILE] Processing file content");
    let documents: Document[];
    if (isTextFile) {
      // For text files, create a single document from the content
      console.log("[UPLOAD-FILE] Processing text file");
      const textContent = buffer.toString("utf-8");
      documents = [
        new Document({
          pageContent: textContent,
          metadata: { source: tempFileName },
        }),
      ];
    } else {
      // For PDFs, use the PDFLoader
      console.log("[UPLOAD-FILE] Processing PDF file with PDFLoader");
      const loader = new PDFLoader(tempFilePath);
      documents = await loader.load();
      console.log("[UPLOAD-FILE] PDF loaded", { pageCount: documents.length });
    }

    // Clean up temp file
    console.log("[UPLOAD-FILE] Cleaning up temp file");
    await unlink(tempFilePath);

    // Split text into chunks
    console.log("[UPLOAD-FILE] Splitting content into chunks");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunk_size ?? DEFAULT_CHUNK_SIZE,
      chunkOverlap: chunk_overlap ?? DEFAULT_CHUNK_OVERLAP,
    });
    const chunks = await splitter.splitDocuments(documents);
    console.log("[UPLOAD-FILE] Content split into chunks", {
      chunkCount: chunks.length,
    });

    // Add file_id metadata to each chunk
    console.log("[UPLOAD-FILE] Adding metadata to chunks");
    chunks.forEach((chunk) => {
      chunk.metadata.file_id = fileId;
      chunk.metadata.team_id = teamId;
    });

    // Create embeddings
    console.log("[UPLOAD-FILE] Creating embeddings");
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
      model: "text-embedding-3-small",
    });

    try {
      console.log("[UPLOAD-FILE] Storing documents in vector store");
       // Configure batch size
      const BATCH_SIZE = 20;
      const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);
      
      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batchChunks = chunks.slice(i, i + BATCH_SIZE);
        console.log(`[UPLOAD-FILE] Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${totalBatches}`);
        
        await SupabaseVectorStore.fromDocuments(batchChunks, embeddings, {
          client: supabaseAdmin,
          tableName: "documents",
          queryName: `upload_batch_${Math.floor(i/BATCH_SIZE)}`,
        });
        
        // Add a small delay between batches to prevent rate limiting
        if (i + BATCH_SIZE < chunks.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      console.log("[UPLOAD-FILE] Documents stored in vector store");

      console.log("[UPLOAD-FILE] Inserting file record");
      await supabaseAdmin.from("files").insert({
        file_id: fileId,
        type: `${isTextFile ? "text" : "pdf"}`,
        file_name: fileName,
        team_id: teamId,
        storage_path: storageData.path,
      });
      console.log("[UPLOAD-FILE] File record inserted");

      // Update Loops contact
      if (apiKeyData.profiles?.email) {
        try {
          console.log("[UPLOAD-FILE] Updating Loops contact");
          updateLoopsContact({
            email: apiKeyData.profiles.email,
            isFileUploaded: true,
          });
          console.log("[UPLOAD-FILE] Loops contact updated");
        } catch (error) {
          console.error("[UPLOAD-FILE] Error updating Loops contact:", error);
        }
      }

      // console.log("[UPLOAD-FILE] Capturing PostHog event");
      // client.capture({
      //   distinctId: apiKeyData.user_id as string,
      //   event: "file_uploaded",
      //   properties: {
      //     file_type: isTextFile ? "text" : "pdf",
      //     file_size: buffer.length,
      //     chunk_count: chunks.length,
      //     team_id: teamId,
      //   },
      // });

      console.log("[UPLOAD-FILE] Logging API usage");
      logApiUsageAsync({
        endpoint: "/upload_file",
        userId: apiKeyData.user_id || "",
        success: true,
      });

      console.log("[UPLOAD-FILE] Sending successful response");
      return NextResponse.json({
        success: true,
        message: `${isTextFile ? "Text" : "PDF"} file processed successfully`,
        file_name: fileName,
        file_id: fileId,
        chunks: chunks.length,
        chunk_size: chunk_size ?? DEFAULT_CHUNK_SIZE,
        chunk_overlap: chunk_overlap ?? DEFAULT_CHUNK_OVERLAP,
      });
    } catch (error) {
      console.error("[UPLOAD-FILE] Error processing file:", error);
      throw error;
    }
  } catch (error) {
    console.error("[UPLOAD-FILE] Error processing file:", error);

    if (request.headers.get("authorization")) {
      const apiKey = request.headers.get("authorization") as string;
      console.log("[UPLOAD-FILE] Attempting to log error with user ID");
      const { data: apiKeyData } = await supabaseAdmin
        .from("api_keys")
        .select("user_id")
        .match({ api_key: apiKey })
        .single();

      if (apiKeyData?.user_id) {
        logApiUsageAsync({
          endpoint: "/upload_file",
          userId: apiKeyData.user_id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        console.log("[UPLOAD-FILE] Error logged for user", {
          userId: apiKeyData.user_id,
        });
      }
    }

    console.log("[UPLOAD-FILE] Sending error response");
    return NextResponse.json({
      success: false,
      error: `Failed to process file${
        error instanceof Error ? `: ${error.message}` : ""
      }`,
    });
  }
}
