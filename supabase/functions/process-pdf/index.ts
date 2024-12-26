import { createClient } from "npm:@supabase/supabase-js@2.47.10";
import { OpenAIEmbeddings } from "npm:@langchain/openai@0.3.16";
import { RecursiveCharacterTextSplitter } from "npm:langchain@0.3.8/text_splitter";
import { PDFLoader } from "npm:@langchain/community@0.3.0/document_loaders/fs/pdf";
import { SupabaseVectorStore } from "npm:@langchain/community@0.3.0/vectorstores/supabase";
import process from "node:process";

console.log("Hello from PDF Functions!");

Deno.serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    );

    // Get the form data from the request
    const formData = await req.formData();
    const pdfFile = formData.get("pdf") as File;

    if (!pdfFile) {
      return new Response(JSON.stringify({ error: "No PDF file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Create a temporary file in Deno
    const tempFilePath = await Deno.makeTempFile({ suffix: ".pdf" });
    await Deno.writeFile(tempFilePath, buffer);

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${pdfFile.name}`;
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage.from("pdfs").upload(fileName, buffer);

    if (uploadError) {
      await Deno.remove(tempFilePath);
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
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
          client: supabaseClient,
          tableName: "vectors",
          queryName: "match_vectors",
        },
      );
    } catch (vectorError) {
      return new Response(
        JSON.stringify({ error: vectorError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        message: "PDF processed successfully",
        fileName: uploadData.path,
        chunks: chunks.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error processing PDF:", error);
    return new Response(JSON.stringify({ error: "Failed to process PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
