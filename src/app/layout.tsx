import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Rema-Blog - Write, Read, Inspire",
  description: "A clean publishing platform built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="min-h-screen">
          <div className="container">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}