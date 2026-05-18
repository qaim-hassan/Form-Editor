import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dynamic Form Builder",
  description: "Create, share, and collect form submissions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}
