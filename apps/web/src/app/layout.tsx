import "@/styles/tailwind.css";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { APP_NAME } from "./consts";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/theme-provider";
import { CSPostHogProvider } from "./providers";

export const metadata: Metadata = {
  title: {
    template: `%s - ${APP_NAME}`,
    default: `${APP_NAME} - The open source RAG as a Service platform.`,
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
      <CSPostHogProvider>
        <body className="min-h-screen bg-background antialiased w-full mx-auto scroll-smooth font-sans">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </CSPostHogProvider>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS!} />
    </html>
  );
}
