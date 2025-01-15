"use client";

import type { Tables } from "@/types/supabase";
import { File, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function UploadedFilesList({
  files,
}: {
  files: Tables<"files">[] | null;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delete_file`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to delete file: ${response.status}`
        );
      }
    } catch (error) {
      toast.error(
        `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(file.file_id!, file.file_name!)}
                    disabled={isDeleting}
                  >
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
