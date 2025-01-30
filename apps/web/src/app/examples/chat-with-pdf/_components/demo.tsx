"use client";

import { FileUploadForm } from "@/app/dashboard/file-upload-form";
import { CornerRightUp } from "lucide-react";
import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import { FileList } from "./file-list";

export const Demo = () => {
  const [showResult, setShowResult] = useState(false);
  const [doneUploading, setDoneUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    localStorage.removeItem("pdfFileName_demo");
  }, []);

  useEffect(() => {
    if (doneUploading) {
      setFileName(localStorage.getItem("pdfFileName_demo"));
    }
  }, [doneUploading]);

  const { messages, isLoading, handleSubmit, input, setInput } = useChat({
    api: "/api/examples/chat-with-pdf",
    initialMessages: [],
    onResponse() {
      setShowResult(true);
    },
  });

  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
    handleSubmit();
  };

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
        <form className="relative" onSubmit={submitForm}>
          <textarea
            className="mx-auto h-[52px] flex border border-input px-3 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-xl bg-black/5 dark:bg-white/5 w-full rounded-2xl sm:rounded-3xl pl-10 sm:pl-12 pr-12 sm:pr-16 placeholder:text-black/70 dark:placeholder:text-white/70 border-none ring-black/30 dark:ring-white/30 text-black dark:text-white text-wrap py-3 sm:py-4 text-sm sm:text-base max-h-[200px] overflow-y-auto resize-none leading-[1.2] min-h-[52px]"
            placeholder="What do you want to ask?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-xl bg-black/5 dark:bg-white/5 py-1 px-1"
          >
            <CornerRightUp className="w-4 h-4 text-muted-foreground" />
          </button>
        </form>
      </div>
      {isLoading && !showResult ? (
        <p>Loading...</p>
      ) : (
        <p>{messages.at(-1)?.content}</p>
      )}
    </div>
  );
};
