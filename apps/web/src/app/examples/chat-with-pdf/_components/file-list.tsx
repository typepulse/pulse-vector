"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export const FileList = ({
  fileName,
  setFileName,
}: {
  fileName: string;
  setFileName: (fileName: string | null) => void;
}) => {
  const router = useRouter();

  return (
    <div className="bg-secondary-foreground/15 p-3 rounded-md flex items-center justify-between">
      <span>{fileName}</span>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          localStorage.removeItem("pdfFileId_demo");
          localStorage.removeItem("pdfFileName_demo");
          setFileName(null);

          router.refresh();
        }}
      >
        <X />
      </Button>
    </div>
  );
};
