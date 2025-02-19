import Link from "next/link";
import { Section } from "../section";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

export function FeaturedSection() {
  return (
    <Section id="featured">
      <div className="border overflow-hidden w-full p-6 lg:p-12">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-base font-medium text-foreground/90">
              Featured on Product Hunt Newsletter
            </span>
          </div>
          <p className="max-w-[600px] text-muted-foreground text-base">
            A flexible, open-source alternative to closed RAG systems, giving
            developers full control without proprietary limitations.
          </p>
          <Link
            target="_blank"
            href="https://www.producthunt.com/newsletters/archive/37746-rag-as-a-service"
            className={cn(buttonVariants({ variant: "link" }), "rounded-lg")}
          >
            View on Product Hunt
          </Link>
        </div>
      </div>
    </Section>
  );
}
