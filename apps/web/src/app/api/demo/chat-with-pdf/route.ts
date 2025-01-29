import { NextRequest, NextResponse } from "next/server";
import axios from "redaxios";
import { openai } from "@ai-sdk/openai";
import { type Message, streamText } from "ai";
import { getMostRecentUserMessage } from "@/app/examples/chat-with-pdf/utils";

export async function POST(req: NextRequest) {
  const { messages }: { messages: Array<Message> } = await req.json();

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/embeddings`,
      {
        query: userMessage.content,
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

    const result = streamText({
      model: openai("gpt-4o-mini"),
      prompt: `Answer to the query based on the provided context below:
      ${response.data.documents.map((doc: any) => doc.content).join("\n")}
      Query: ${userMessage.content}`,
    });

    return result.toDataStreamResponse();
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
