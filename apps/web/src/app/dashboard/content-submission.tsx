"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ContentSubmission() {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/submit-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, content }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit content");
      }

      const data = await res.json();
      setSuccess(`Content "${name}" submitted successfully!`);
      setName("");
      setContent("");
    } catch (err) {
      setError("An error occurred while submitting content");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Submit Content</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="content-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Content Name:
          </label>
          <Input
            id="content-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a name for your content"
            required
          />
        </div>
        <div>
          <label
            htmlFor="content-body"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Content:
          </label>
          <Textarea
            id="content-body"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your content here..."
            rows={10}
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Content"}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert
          variant="default"
          className="mt-4 bg-green-50 text-green-800 border-green-300"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
