"use client";

import React, { useEffect, useState } from "react";
import { File } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface UploadedFile {
  id: number;
  file_name: string | null;
  created_at: string;
  file_id: string | null;
}

export function UploadedFilesList() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchFiles = async () => {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching files:", error);
        return;
      }

      setFiles(data || []);
    };

    fetchFiles();
  }, [supabase]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
      {files.length === 0 ? (
        <p className="text-muted-foreground">
          No files have been uploaded yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between bg-muted p-3 rounded-md"
            >
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">{file.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
