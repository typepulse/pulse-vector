import type { Metadata } from "next";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Community } from "@/components/sections/community";
import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  description:
    "The open-source alternative to Carbon.ai. Build powerful RAG applications with any data source, at any scale.",
};

export default async function Home() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  return (
    <main>
      <Header isLoggedIn={!!user?.user} />
      <Hero />
      <Community />
      <CTA />
      <Footer />
    </main>
  );
}
