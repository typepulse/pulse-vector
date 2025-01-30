import { createClient } from "@/utils/supabase/server";
import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";

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
      <main className="w-full container mx-auto py-24 border-x border-b">
        {children}
      </main>
      <Footer />
    </>
  );
}
