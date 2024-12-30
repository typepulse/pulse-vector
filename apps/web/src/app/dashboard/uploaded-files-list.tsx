"use client";

import React from "react";
import { File, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  id: string;
  name: string;
  uploadDate: Date;
}

interface UploadedFilesListProps {
  files: UploadedFile[];
  onDelete: (id: string) => void;
}

export function UploadedFilesList({ files, onDelete }: UploadedFilesListProps) {
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
                  <p className="font-medium">{file.name}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(file.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete file</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
