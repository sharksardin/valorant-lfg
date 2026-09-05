import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { MessageSquare, Users } from "lucide-react";
import LoginButton from "@/components/LoginButton";
import GlobalNotification from "@/components/GlobalNotification";
import Footer from "@/components/Footer";

import NavChatBadge from "@/components/NavChatBadge";

export const metadata: Metadata = {
  title: "VALODUO - 발로란트 듀오/파티 찾기",
  description: "나와 딱 맞는 발로란트 듀오와 파티원을 실시간으로 찾아보세요. 전적 연동, 매너 온도 기능 지원.",
  keywords: ["발로란트", "발로란트 듀오", "발로란트 파티", "발로란트 전적", "valorant", "lfg"],
  openGraph: {
    title: "VALODUO - 발로란트 듀오/파티 찾기",
    description: "나와 딱 맞는 발로란트 듀오와 파티원을 실시간으로 찾아보세요.",
    siteName: "VALODUO",
    locale: "ko_KR",
    type: "website",
  },
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
