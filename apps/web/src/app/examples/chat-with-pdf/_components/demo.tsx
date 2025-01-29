"use client";

import { FileUploadForm } from "@/app/dashboard/file-upload-form";

export const Demo = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    fetch("http://localhost:3000/api/demo/chat-with-pdf", {
      method: "POST",
      body: JSON.stringify({ query: "hello" }),
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
            value="fdsdsf"
          />
          <button
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-xl bg-black/5 dark:bg-white/5 py-1 px-1"
            type="submit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-corner-right-up w-3.5 sm:w-4 h-3.5 sm:h-4 transition-opacity dark:text-white opacity-30"
            >
              <polyline points="10 9 15 4 20 9"></polyline>
              <path d="M4 20h7a4 4 0 0 0 4-4V4"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};
