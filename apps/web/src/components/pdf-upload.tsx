"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function PdfUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/process-pdf`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process PDF");
      }

      const result = await response.json();
      console.log("PDF processed successfully:", result);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <label className="block mb-2 text-sm font-medium text-gray-900">
        Upload PDF
      </label>
      <div className="relative">
        <input
          type="file"
          accept=".pdf"
          onChange={(e) =>
            e.target.files?.[0] && handleUpload(e.target.files[0])
          }
          className="block w-full text-sm text-gray-900 border rounded-lg cursor-pointer"
          disabled={isUploading}
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
            <div className="animate-spin h-5 w-5 border-2 border-gray-900 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>
      {isUploading && (
        <p className="mt-2 text-sm text-gray-600">
          Processing PDF, please wait...
        </p>
      )}
    </div>
  );
}
