"use client";

import { FileUploadForm } from "@/app/dashboard/file-upload-form";
import { useEffect, useState } from "react";
import { FileList } from "./file-list";
import { Chat } from "./chat";

export const Demo = () => {
  const [doneUploading, setDoneUploading] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    localStorage.removeItem("pdfFileId_demo");
    localStorage.removeItem("pdfFileName_demo");
  }, []);

  useEffect(() => {
    if (doneUploading) {
      setFileId(localStorage.getItem("pdfFileId_demo"));
      setFileName(localStorage.getItem("pdfFileName_demo"));
    }
  }, [doneUploading]);

  const submitFile = async (formData: FormData) => {
    setDoneUploading(false);

    const response = await fetch("/api/examples/upload-file", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const responseClone = response.clone();
      const result = await responseClone.json();
      localStorage.setItem("pdfFileId_demo", result.file_id);
      localStorage.setItem("pdfFileName_demo", result.file_name);
    }

    return response;
  };

  const callBack = () => {
    setDoneUploading(true);
  };

  return (
    <div className="space-y-8 min-w-[400px] w-full p-4 mt-8">
      <FileUploadForm
        placeholder="Drag 'n' drop a PDF file here (max 20MB), or click to select one"
        submitFile={submitFile}
        callBack={callBack}
      />
      <div className="relative max-w-xl w-full mx-auto flex flex-col gap-4">
        {fileName && <FileList fileName={fileName} setFileName={setFileName} />}
        {fileName && fileId && <Chat fileId={fileId} />}
      </div>
    </div>
  );
};
