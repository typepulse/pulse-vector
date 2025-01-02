import { Container } from "@/components/container";
import { Gradient } from "@/components/gradient";
import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";
import JointlistForm from "./_components/jointlist-form";
import { Footer } from "./_components/footer";
import { Header } from "@/components/sections/header";

export const metadata: Metadata = {
  description:
    "The open-source alternative to Carbon.ai. Build powerful RAG applications with any data source, at any scale.",
};

function Hero() {
  return (
    <div className="relative">
      <Gradient className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-inset ring-black/5" />
      <Container className="relative">
        <Navbar />
        <div className="pb-24 pt-16 sm:pb-32 sm:pt-24 md:pb-48 md:pt-32">
          <h1 className="font-display text-balance text-6xl/[0.9] font-medium tracking-tight text-gray-950 sm:text-8xl/[0.8] md:text-9xl/[0.8]">
            Connect your data to LLMs, no matter the source.
          </h1>
          <p className="mt-8 max-w-lg text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
            The open-source alternative to Carbon.ai.
            <br />
            Build powerful RAG applications with any data source, at any scale.
          </p>
          <div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row">
            <JointlistForm />
          </div>
        </div>
      </Container>
    </div>
  );
}

export default async function Home() {
  return (
    <div className="overflow-hidden">
      <Header />
      <Hero />
      <Footer />
    </div>
  );
}
