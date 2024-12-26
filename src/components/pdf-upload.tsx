"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export const PdfUpload = () => {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const { data, error } = await supabase.storage
        .from("pdfs")
        .upload(`${Date.now()}-${file.name}`, file);

      if (error) throw error;

      // PDFの処理をトリガー
      const response = await fetch("/api/process-pdf", {
        method: "POST",
        body: JSON.stringify({ path: data.path }),
      });

      const result = await response.json();
      console.log({ result });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={handleFileUpload} />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
