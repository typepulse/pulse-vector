import { type Message, createDataStreamResponse, streamText } from "ai"

import { getMostRecentUserMessage } from "@/lib/utils"

import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  const {
    messages,
    selectedFile,
    apiKey,
  }: {
    messages: Array<Message>
    selectedFile: string
    apiKey: string
  } = await request.json()

  const userMessage = getMostRecentUserMessage(messages)

  if (!userMessage) {
    return new Response("No user message found", { status: 400 })
  }

  // Call supavec embeddings API
  const embeddingsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/v1/embeddings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        query: userMessage.content,
        file_ids: [selectedFile],
      }),
    }
  )

  if (!embeddingsResponse.ok) {
    const errorData = await embeddingsResponse.json()
    console.error("Embeddings API error:", errorData)
    return new Response("Failed to get embeddings", {
      status: embeddingsResponse.status,
    })
  }

  const embeddings = await embeddingsResponse.json()

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: openai("gpt-4o-mini"),
        system:
          "You are a helpful assistant that can answer questions and help with tasks.\n\nRelevant context from the document:\n" +
          embeddings.documents
            .map((doc: { content: string }) => doc.content)
            .join("\n"),
        messages,
      })

      result.consumeStream()

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      })
    },
    onError: () => {
      return "Oops, an error occured!"
    },
  })
}
