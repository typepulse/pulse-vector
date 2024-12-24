import "@/styles/tailwind.css";
import type { Metadata } from "next";
import { APP_NAME } from "./consts";

export const metadata: Metadata = {
  title: {
    template: "%s - Radiant",
    default: `${APP_NAME} - Connect your data to LLMs, no matter the source.`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/css?f%5B%5D=switzer@400,500,600,700&amp;display=swap"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="The Radiant Blog"
          href="/blog/feed.xml"
        />
      </head>
      <body className="text-gray-950 antialiased">{children}</body>
    </html>
  );
}
