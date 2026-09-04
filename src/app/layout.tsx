import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { MessageSquare, Users } from "lucide-react";
import LoginButton from "@/components/LoginButton";
import GlobalNotification from "@/components/GlobalNotification";
import Footer from "@/components/Footer";

import NavChatBadge from "@/components/NavChatBadge";

export const metadata: Metadata = {
  title: "Valorant Duo Finder",
  description: "Find your perfect Valorant duo and climb the ranks together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased flex flex-col min-h-screen">
        <GlobalNotification />
        <nav className="border-b border-gray-800 bg-[#111]">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-[var(--valo-red)] font-bold text-2xl tracking-tighter">VALO<span className="text-white">DUO</span></span>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-[var(--valo-red)] transition-colors flex items-center gap-1"><Users size={18}/> 파티 찾기</Link>
              <Link href="/news" className="hover:text-[var(--valo-red)] transition-colors text-gray-300">뉴스/가이드</Link>
              <NavChatBadge />
              <LoginButton />
            </div>
          </div>
        </nav>
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
