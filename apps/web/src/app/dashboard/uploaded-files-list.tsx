"use client";

import { File } from "lucide-react";
import type { Tables } from "@/types/supabase";

export function UploadedFilesList({
  files,
}: {
  files: Tables<"files">[] | null;
}) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
      {files?.length === 0 ? (
        <p className="text-muted-foreground">
          No files have been uploaded yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {files?.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between bg-muted p-3 rounded-md"
            >
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">{file.file_name}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
