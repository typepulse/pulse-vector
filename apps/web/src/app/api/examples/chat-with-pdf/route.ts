import { NextRequest, NextResponse } from "next/server";
import axios from "redaxios";
import { openai } from "@ai-sdk/openai";
import { type Message, streamText } from "ai";
import { getMostRecentUserMessage } from "@/app/examples/chat-with-pdf/utils";

type Document = {
  content: string;
};

export async function POST(req: NextRequest) {
  const { messages, fileId }: { messages: Array<Message>; fileId: string } =
    await req.json();

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_URL}/api/v1/embeddings`,
      {
        query: userMessage.content,
        file_ids: [fileId],
      },
      {
        headers: {
          "Content-Type": "application/json",
          authorization: process.env.DEMO_SUPA_API_KEY!,
        },
      },
    );

    const result = streamText({
      model: openai("gpt-4o-mini"),
      prompt: `Answer to the query based on the provided context below:
      ${response.data.documents.map((doc: Document) => doc.content).join("\n")}
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
