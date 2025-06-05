import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from '@/components/Sidebar'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Presentation App',
  description: 'A Next.js presentation viewer with markdown support',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-100 font-sans">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>

  );
}
