import { type Message, createDataStreamResponse, streamText } from "ai";

import { getMostRecentUserMessage } from "@/lib/utils";

import { openai } from "@ai-sdk/openai";

export async function POST(request: Request) {
  const {
    messages,
    selectedFile,
  }: { messages: Array<Message>; selectedFile: string } = await request.json();

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: openai("gpt-4o-mini"),
        system:
          "You are a helpful assistant that can answer questions and help with tasks.",
        messages,
      });

      result.consumeStream();

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: () => {
      return "Oops, an error occured!";
    },
  });
}
