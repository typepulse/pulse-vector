"use client";

import type { Tables } from "@/types/supabase";
import { File, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
              <div className="flex items-center space-x-3 w-full">
                <File className="h-5 w-5 text-blue-500" />
                <div className="flex items-center justify-between w-full">
                  <p className="font-medium">{file.file_name}</p>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="size-5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
