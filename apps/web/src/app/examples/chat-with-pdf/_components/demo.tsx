"use client";

import { FileUploadForm } from "@/app/dashboard/file-upload-form";
import { CornerRightUp } from "lucide-react";

export const Demo = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    fetch("http://localhost:3000/api/demo/chat-with-pdf", {
      method: "POST",
      body: JSON.stringify({ query: "what is this about?" }),
    });
    e.preventDefault();
    console.log("submitted");
  };

  return (
    <div className="space-y-8 min-w-[400px] w-full border rounded-3xl p-4 mt-8">
      <FileUploadForm apiKey={`fdshj`} />
      <div className="relative max-w-xl w-full mx-auto flex flex-col gap-2">
        <form className="relative" onSubmit={handleSubmit}>
          <textarea
            className="mx-auto h-[52px] flex border border-input px-3 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-xl bg-black/5 dark:bg-white/5 w-full rounded-2xl sm:rounded-3xl pl-10 sm:pl-12 pr-12 sm:pr-16 placeholder:text-black/70 dark:placeholder:text-white/70 border-none ring-black/30 dark:ring-white/30 text-black dark:text-white text-wrap py-3 sm:py-4 text-sm sm:text-base max-h-[200px] overflow-y-auto resize-none leading-[1.2] min-h-[52px]"
            id="ai-input-with-file"
            placeholder="File Upload and Chat!"
          />
          <button
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-xl bg-black/5 dark:bg-white/5 py-1 px-1"
            type="submit"
          >
            <CornerRightUp className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
