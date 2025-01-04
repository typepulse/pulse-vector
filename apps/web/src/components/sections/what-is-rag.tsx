import { Section } from "@/components/section";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

export const WhatIsRag = () => {
  return (
    <Section id="what-is-rag">
      <div className="border overflow-hidden w-full p-6 lg:p-12">
        <h2 className="text-foreground mb-6 text-balance font-medium text-3xl">
          What is RAG?
        </h2>
        <div className="text-muted-foreground text-balance space-y-4">
          <p>
            RAG (Retrieval-Augmented Generation) is a powerful approach that
            enhances AI responses with relevant information from your documents.
            Instead of relying solely on an AI's general knowledge, RAG searches
            through your specific documents to provide accurate, context-aware
            answers.
          </p>
          <p>
            Think of RAG as giving your AI assistant access to your
            organization's knowledge base. When you ask a question, it first
            finds the most relevant information from your documents, then uses
            this specific context to generate a precise answer.
          </p>
        </div>
        <a
          href="https://docs.supavec.com/#what-is-rag"
          className={cn(buttonVariants({ variant: "link" }), "px-0 mt-3")}
        >
          Learn more.
        </a>
      </div>
    </Section>
  );
};
