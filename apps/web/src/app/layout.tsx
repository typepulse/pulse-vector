import "@/styles/tailwind.css";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { APP_NAME } from "./consts";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
  title: {
    template: `%s - ${APP_NAME}`,
    default: `${APP_NAME} - Connect your data to LLMs, no matter the source.`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/css?f%5B%5D=switzer@400,500,600,700&amp;display=swap"
        />
      </head>
      <body className="min-h-screen bg-background antialiased w-full mx-auto scroll-smooth font-sans">
        {children}
        <Toaster />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS!} />
    </html>
  );
}
