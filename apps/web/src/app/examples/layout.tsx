import { Header } from "@/components/sections/header";
import { createClient } from "@/utils/supabase/server";

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
      <main className="w-full container mx-auto py-24">{children}</main>
    </>
  );
}
