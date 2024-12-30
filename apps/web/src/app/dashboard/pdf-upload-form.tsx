"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PDFUploadForm() {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const removeFile = () => {
    setFiles([]);
  };

  return (
    <div className="mt-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-gray-300 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? "Drop the PDF file here"
            : "Drag 'n' drop a PDF file here, or click to select one"}
        </p>
      </div>
      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
            <div className="flex items-center">
              <File className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium">{files[0].name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={removeFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
