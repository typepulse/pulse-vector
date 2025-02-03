"use client";

import { FileText, MessageSquare } from "lucide-react";

export function Stepper({ currentStep = 1 }: { currentStep?: number }) {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 my-5">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-800">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
            style={{ width: currentStep === 1 ? "0%" : "100%" }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${currentStep >= 1 ? "bg-blue-500" : "bg-gray-800"}
              transition-colors duration-300
            `}
            >
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium text-gray-400">Step 1</span>
              <span className="text-sm font-medium text-white">Upload PDF</span>
              <span className="text-xs text-gray-500">
                Choose your document
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${currentStep >= 2 ? "bg-blue-500" : "bg-gray-800"}
              transition-colors duration-300
            `}
            >
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium text-gray-400">Step 2</span>
              <span className="text-sm font-medium text-white">Chat</span>
              <span className="text-xs text-gray-500">
                Ask questions about your PDF
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
