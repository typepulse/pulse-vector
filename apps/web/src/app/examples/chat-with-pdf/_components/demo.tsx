"use client";

import { AIInputWithFile } from "@/components/ui/ai-input-with-file";

export const Demo = () => {
  const handleSubmit = (message: string, file?: File) => {
    console.log("Message:", message);
    console.log("File:", file);
  };

  return (
    <div className="space-y-8 min-w-[400px] w-full border rounded-3xl p-4 mt-8">
      <AIInputWithFile onSubmit={handleSubmit} />
    </div>
  );
};
