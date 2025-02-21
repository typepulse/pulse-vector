"use client";

import type { Tables } from "@/types/supabase";
import * as React from "react";
import { Code, MessageCircle, ArrowUpIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Embedding = {
  query_embedding: number[];
  document_embeddings: {
    text: string;
    embedding: number[];
    similarity_score: number;
  }[];
  metadata: {
    model: string;
    dimensions: number;
    processing_time_ms: number;
  };
};

type Message = {
  role: "user" | "assistant";
  content: string;
  embedding?: Embedding;
};

export function ChatInterface({
  uploadedFiles,
}: {
  uploadedFiles: Tables<"files">[] | null;
}) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  React.useEffect(() => {
    // Simulating an API call to get available files
    const fetchFiles = async () => {
      // In a real scenario, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
    };

    fetchFiles();
  }, []);

  const handleFileSelect = (file: string) => {
    setSelectedFile(file);
    // Clear previous messages when a new file is selected
    setMessages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedFile) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Replace with your actual API call
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          file: selectedFile,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        embedding: data.embedding, // The embedding data from your API
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-7 gap-4 p-4">
      <Card className="col-span-4 h-[600px] flex flex-col bg-background">
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
        <form onSubmit={handleSubmit} className="p-4 border-t">
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
              <ArrowUpIcon size={14} />
            </Button>
          </div>
        </form>
      </Card>

      <Card className="col-span-3 h-[600px] flex flex-col bg-background">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Code className="size-5" />
            Technical Details
          </h2>
        </div>
        <Tabs defaultValue="embedding" className="flex-1">
          <div className="p-4 border-b">
            <TabsList>
              <TabsTrigger value="embedding">Embedding Data</TabsTrigger>
              <TabsTrigger value="raw">Raw Response</TabsTrigger>
            </TabsList>
          </div>
          <ScrollArea className="flex-1">
            <TabsContent value="embedding" className="p-4">
              {messages
                .filter((message) => message.embedding)
                .map((message, index) => (
                  <div key={index} className="mb-4">
                    <div className="font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                      <pre>{JSON.stringify(message.embedding, null, 2)}</pre>
                    </div>
                  </div>
                ))}
            </TabsContent>
            <TabsContent value="raw" className="p-4">
              {messages.map((message, index) => (
                <div key={index} className="mb-4">
                  <div className="font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                    <pre>{JSON.stringify(message, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </Card>
    </div>
  );
}
