import process from "node:process";
import { createClient } from "jsr:@supabase/supabase-js@^2.47.10";
import { OpenAIEmbeddings } from "npm:@langchain/openai@0.3.16";
import { RecursiveCharacterTextSplitter } from "npm:langchain@0.3.8/text_splitter";
import { PDFLoader } from "npm:@langchain/community@0.3.0/document_loaders/fs/pdf";
import { SupabaseVectorStore } from "npm:@langchain/community@0.3.0/vectorstores/supabase";

console.log("Hello from PDF Functions!");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const buffer = new Uint8Array(await req.arrayBuffer());

    if (buffer.length === 0) {
      return new Response(JSON.stringify({ error: "No PDF data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a temporary file path
    const tempFileName = `${crypto.randomUUID()}.pdf`;
    const tempFilePath = `/tmp/${tempFileName}`;
    await Deno.writeFile(tempFilePath, buffer);

    // Upload to Supabase Storage
    const uploadId = crypto.randomUUID();
    const { error } = await supabase.storage.createBucket(uploadId, {
      public: false,
    });

    if (error) {
      console.error("Error creating bucket:", error);
      await Deno.remove(tempFilePath);
      throw new Error(error.message);
    }

    const fileName = `${uploadId}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage.from(uploadId).upload(fileName, buffer);

    if (uploadError) {
      await Deno.remove(tempFilePath);
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load and process PDF with LangChain
    const loader = new PDFLoader(tempFilePath);
    const pages = await loader.load();

    // Clean up temp file
    await Deno.remove(tempFilePath);

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
      await SupabaseVectorStore.fromDocuments(
        chunks,
        embeddings,
        {
          client: supabase,
          tableName: "vectors",
          queryName: "match_vectors",
        },
      );
    } catch (vectorError) {
      throw new Error(vectorError.message);
    }

    return new Response(
      JSON.stringify({
        message: "PDF processed successfully",
        fileName: uploadData.path,
        chunks: chunks.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error processing PDF:", error);
    return new Response(
      JSON.stringify({
        error: `Failed to process PDF${
          error.message ? `: ${error.message}` : ""
        }`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
