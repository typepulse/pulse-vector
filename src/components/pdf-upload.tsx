"use client";

import { useState } from "react";

export function PdfUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      // ハンドリング
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
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        className="block w-full text-sm text-gray-900 border rounded-lg cursor-pointer"
      />
    </div>
  );
}
