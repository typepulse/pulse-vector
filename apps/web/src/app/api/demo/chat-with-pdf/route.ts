import { NextRequest, NextResponse } from "next/server";
import axios from "redaxios";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: NextRequest) {
  const reqJson = await req.json();

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/embeddings`,
      {
        query: reqJson.query,
        file_ids: ["fcf9d747-e22d-4803-9678-69f80bc15b32"],
      },
      {
        headers: {
          "Content-Type": "application/json",
          authorization: process.env.DEMO_SUPA_API_KEY!,
        },
      },
    );

    console.log({ response: response.data.documents });

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Answer to the query based on the provided context below:
      ${response.data.documents.map((doc: any) => doc.content).join("\n")}
      Query: ${reqJson.query}`,
    });

    return NextResponse.json({
      success: true,
      answer: text,
    });
  } catch (error) {
    if (
      error && typeof error === "object" && "data" in error && error.data &&
      typeof error.data === "object" && "error" in error.data
    ) {
      console.log({ error: error.data.error });
      return NextResponse.json({
        success: false,
        error: error.data.error,
      }, { status: 400 });
    }
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred",
    }, { status: 400 });
  }
}
