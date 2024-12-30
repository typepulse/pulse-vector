"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/types/supabase";

export function EmbeddingsQuery({
  uploadedFiles,
}: {
  uploadedFiles: Tables<"files">[] | null;
}) {
  const [query, setQuery] = useState("");
  const [selectedFileId, setSelectedFileId] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, file_id: selectedFileId }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch embeddings");
      }

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError("An error occurred while fetching embeddings");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Embeddings Query</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="file-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select a file:
          </label>
          <Select onValueChange={setSelectedFileId} value={selectedFileId}>
            <SelectTrigger id="file-select">
              <SelectValue placeholder="Select a file" />
            </SelectTrigger>
            <SelectContent>
              {uploadedFiles.map((file) => (
                <SelectItem key={file.id} value={file.file_id}>
                  {file.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="query"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Enter your query:
          </label>
          <Input
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your query here..."
            required
          />
        </div>
        <Button type="submit" disabled={isLoading || !selectedFileId}>
          {isLoading ? "Fetching..." : "Get Embeddings"}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {response && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Response:</h4>
          <Textarea
            value={response}
            readOnly
            className="font-mono text-sm"
            rows={10}
          />
        </div>
      )}
    </div>
  );
}
