import { NextRequest, NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { z } from "zod";
import { randomUUID } from "crypto";
import { updateLoopsContact } from "@/utils/loops";
// import { client } from "@/utils/posthog";
import { logApiUsageAsync } from "@/utils/async-logger";
import { supabaseAdmin } from "@/utils/supabase/admin";

console.log("[UPLOAD-TEXT] Module loaded");

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

const uploadTextSchema = z.object({
  contents: z.string().min(5, "Content must be at least 5 characters long"),
  name: z.string().min(1).optional().default("Untitled Document"),
  chunk_size: z.coerce.number().positive().nullish(),
  chunk_overlap: z.coerce.number().positive().nullish(),
});

export async function POST(request: NextRequest) {
  console.log("[UPLOAD-TEXT] Request received");
  try {
    const body = await request.json();

    // Validate body parameters
    console.log("[UPLOAD-TEXT] Validating request body");
    const bodyValidation = uploadTextSchema.safeParse(body);
    if (!bodyValidation.success) {
      console.log(
        "[UPLOAD-TEXT] Validation failed",
        bodyValidation.error.issues,
      );
      return NextResponse.json(
        { success: false, error: bodyValidation.error.issues },
        { status: 400 },
      );
    }

    const apiKey = request.headers.get("authorization");
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "No API key provided" },
        { status: 401 },
      );
    }

    // Get team ID from API key
    console.log("[UPLOAD-TEXT] Verifying API key");
    const supabase = supabaseAdmin;
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("team_id, user_id, profiles(email)")
      .match({ api_key: apiKey })
      .single();

    if (apiKeyError || !apiKeyData?.team_id) {
      console.log("[UPLOAD-TEXT] Invalid API key", { error: apiKeyError });
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 },
      );
    }

    const teamId = apiKeyData.team_id as string;
    console.log("[UPLOAD-TEXT] Team ID retrieved", { teamId });

    const {
      contents,
      name,
      chunk_size = DEFAULT_CHUNK_SIZE,
      chunk_overlap = DEFAULT_CHUNK_OVERLAP,
    } = bodyValidation.data;
    console.log("[UPLOAD-TEXT] Processing text upload", {
      name,
      contentLength: contents.length,
      chunk_size,
      chunk_overlap,
    });

    const fileId = randomUUID();
    const fileName = `${fileId}.txt`;
    console.log("[UPLOAD-TEXT] Generated file ID", { fileId, fileName });

    // Upload text content to Supabase Storage
    console.log("[UPLOAD-TEXT] Uploading to Supabase Storage");
    const { data: storageData, error: uploadError } = await supabase.storage
      .from("user_documents")
      .upload(`/${teamId}/${fileName}`, contents, {
        contentType: "text/plain",
        upsert: false,
      });

    if (uploadError) {
      console.log("[UPLOAD-TEXT] Storage upload failed", {
        error: uploadError,
      });
      return NextResponse.json(
        { success: false, error: "Failed to upload file to storage" },
        { status: 500 },
      );
    }
    console.log("[UPLOAD-TEXT] Storage upload successful", {
      path: storageData.path,
    });

    console.log("[UPLOAD-TEXT] Creating text splitter");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunk_size ?? DEFAULT_CHUNK_SIZE,
      chunkOverlap: chunk_overlap ?? DEFAULT_CHUNK_OVERLAP,
    });

    console.log("[UPLOAD-TEXT] Splitting text into chunks");
    const docs = await splitter.createDocuments([contents], [{
      source: name,
      file_id: fileId,
      team_id: teamId,
    }]);
    console.log("[UPLOAD-TEXT] Text split into chunks", {
      chunkCount: docs.length,
    });

    console.log("[UPLOAD-TEXT] Creating embeddings");
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
      model: "text-embedding-3-small",
    });

    console.log("[UPLOAD-TEXT] Storing documents in vector store");
    await SupabaseVectorStore.fromDocuments(docs, embeddings, {
      client: supabase,
      tableName: "documents",
    });
    console.log("[UPLOAD-TEXT] Documents stored in vector store");

    console.log("[UPLOAD-TEXT] Inserting file record");
    await supabase.from("files").insert({
      file_id: fileId,
      type: "text",
      file_name: `${name}.txt`,
      team_id: teamId,
      storage_path: storageData.path,
    });
    console.log("[UPLOAD-TEXT] File record inserted");

    // Update Loops contact
    if (apiKeyData.profiles?.email) {
      try {
        console.log("[UPLOAD-TEXT] Updating Loops contact");
        updateLoopsContact({
          email: apiKeyData.profiles.email,
          isFileUploaded: true,
        });
        console.log("[UPLOAD-TEXT] Loops contact updated");
      } catch (error) {
        console.error("[UPLOAD-TEXT] Error updating Loops contact:", error);
      }
    }

    // console.log("[UPLOAD-TEXT] Capturing PostHog event");
    // client.capture({
    //   distinctId: apiKeyData.profiles?.email as string,
    //   event: "text_upload_completed",
    //   properties: {
    //     file_name: fileName,
    //     file_type: "text",
    //     file_size: contents.length,
    //   },
    // });

    console.log("[UPLOAD-TEXT] Logging API usage");
    logApiUsageAsync({
      endpoint: "/upload-text",
      userId: apiKeyData.user_id || "",
      success: true,
    });

    console.log("[UPLOAD-TEXT] Sending successful response");
    return NextResponse.json({
      success: true,
      message: "Text uploaded and processed successfully",
      file_id: fileId,
    });
  } catch (error) {
    console.error("[UPLOAD-TEXT] Error processing text upload:", error);

    // Log error if we have user information
    if (error instanceof Error) {
      const apiKey = request.headers.get("authorization");
      if (apiKey) {
        console.log("[UPLOAD-TEXT] Attempting to log error with user ID");
        const { data: apiKeyData } = await supabaseAdmin
          .from("api_keys")
          .select("user_id")
          .match({ api_key: apiKey })
          .single();

        if (apiKeyData?.user_id) {
          logApiUsageAsync({
            endpoint: "/upload-text",
            userId: apiKeyData.user_id,
            success: false,
            error: error.message,
          });
          console.log("[UPLOAD-TEXT] Error logged for user", {
            userId: apiKeyData.user_id,
          });
        }
      }
    }

    const message = error instanceof Error
      ? error.message
      : "Failed to upload text";
    console.log("[UPLOAD-TEXT] Sending error response");
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
