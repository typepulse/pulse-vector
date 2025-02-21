"use client";

import type { Tables } from "@/types/supabase";
import { useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Code, MessageCircle, ArrowUpIcon, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Embedding = {
  success: boolean;
  documents: {
    content: string;
  }[];
};

export function ChatInterface({
  uploadedFiles,
  apiKey,
}: {
  uploadedFiles: Tables<"files">[] | null;
  apiKey: string;
}) {
  const [selectedFile, setSelectedFile] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [embeddings, setEmbeddings] = useState<Embedding["documents"]>([]);

  const { messages, setMessages, handleSubmit, input, setInput, isLoading } =
    useChat({
      api: "/api/protected/chat",
      body: {
        apiKey,
        selectedFile,
      },
      initialMessages: [],
      onError: (error) => {
        toast.error(`An error occurred: ${error.message}`);
      },
    });

  const fetchEmbeddings = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/embeddings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        body: JSON.stringify({ query: input, file_ids: [selectedFile] }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch embeddings");
    }

    const data = (await response.json()) as Embedding;
    setEmbeddings(data.documents);
  };

  const handleFileSelect = (file: string) => {
    setSelectedFile(file);
    setMessages([]);
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <Card className="col-span-2 md:col-span-1 h-[600px] flex flex-col bg-background">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="size-5" />
            Chat with your files
          </h2>
          <Select onValueChange={handleFileSelect} value={selectedFile}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Choose a file" />
            </SelectTrigger>
            <SelectContent>
              {uploadedFiles?.map((file) => (
                <SelectItem key={file.id} value={file.file_id!}>
                  {file.file_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="flex-1 p-4">
          {!selectedFile && (
            <div className="text-center text-muted-foreground p-4">
              Please select a file to start chatting.
            </div>
          )}
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await Promise.all([handleSubmit(), fetchEmbeddings()]);
          }}
          className="p-4 border-t"
        >
          <div className="flex gap-2 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your file..."
            />
            <Button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <ArrowUpIcon size={14} />
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="col-span-2 md:col-span-1 h-[600px] flex flex-col bg-background">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Code className="size-5" />
            Embedding data from API
          </h2>
        </div>
        <div className="flex-1">
          <ScrollArea className="flex-1" scrollHideDelay={0}>
            <div className="p-4">
              {embeddings && (
                <div className="font-mono text-sm bg-muted p-4 rounded-lg">
                  <ScrollArea className="w-full whitespace-nowrap">
                    <pre className="whitespace-pre">
                      {JSON.stringify(embeddings, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
}
