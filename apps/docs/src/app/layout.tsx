import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SupaVec Documentation",
  description:
    "Documentation for SupaVec - Vector embeddings and semantic search with Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-white dark:bg-gray-900">
          {children}
        </main>
      </body>
    </html>
  );
}
