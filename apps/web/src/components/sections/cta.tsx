import { Section } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function CTA() {
  return (
    <Section id="cta">
      <div className="border overflow-hidden relative text-center py-16 mx-auto">
        <p className="text-sm text-secondary-foreground/70 text-balance mx-auto font-medium">
          Power your AI with your own data
        </p>

        <p className="max-w-3xl mt-2 text-foreground mb-6 text-balance mx-auto font-medium text-3xl">
          Start your free trial today.
        </p>
        <div className="flex justify-center">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "default" }),
              "flex items-center gap-2"
            )}
          >
            Get Started
          </Link>
        </div>
      </div>
    </Section>
  );
}
