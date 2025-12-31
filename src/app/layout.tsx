import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from "@/components/providers/theme-provider"
import { PageTransition } from "@/components/providers/page-transition"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CR8 - Digital Content Marketplace",
  description: "Sell and discover digital content: music, videos, courses, and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <Toaster />
            <Header />
            <main>
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <Footer />
          </body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  );
}
