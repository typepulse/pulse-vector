import { APP_NAME } from "@/app/consts";
import { Demo } from "./_components/demo";
import { FAQ } from "./_components/faq";

export const metadata = {
  title: "100% Free Chat with PDF",
  description:
    "Chat with any PDF document for free. No email required. Get instant answers from your PDF files using AI.",
  openGraph: {
    title: "Free Chat with PDF",
    description:
      "Chat with any PDF document for free. No email required. Get instant answers from your PDF files using AI.",
  },
  alternates: {
    canonical: "/examples/chat-with-pdf",
  },
};

export default function ChatWithPdf() {
  return (
    <>
      <div className="text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-7xl">
          Free Chat with PDF
        </h1>
        <p className="mt-8 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
          No email required. 100% free. Done in 30 seconds.
        </p>
        <div className="space-y-2 mt-4">
          <p className="text-base text-muted-foreground">
            Try summarizing your PDF or asking questions with our free Chat with
            PDF.
          </p>
          <p className="text-base text-muted-foreground">
            You can build an app like this in minutes with{" "}
            <a
              href="https://www.supavec.com"
              className="underline text-sky-400"
            >
              {APP_NAME}
            </a>
            .
          </p>
        </div>
      </div>
      <Demo />
      <FAQ />
    </>
  );
}
