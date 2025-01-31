import { createClient } from "@/utils/supabase/server";
import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import { CTA } from "./chat-with-pdf/_components/cta";

export default async function ExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  return (
    <>
      <Header isLoggedIn={!!user?.user} />
      <main className="w-full container mx-auto">
        <div className="border-x border-b pt-12 pb-6">{children}</div>
        <CTA />
      </main>
      <Footer />
    </>
  );
}
