"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { LayoutDashboard, Users, AlertTriangle, FileText, ArrowLeft } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      
      // profiles 테이블에 is_admin 컬럼이 true인지 확인
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
        
      if (profile?.is_admin) {
        setIsAdmin(true);
      } else {
        alert("접근 권한이 없습니다. (관리자 전용)");
        router.push("/");
      }
    };
    
    checkAdmin();
  }, [router]);

  // 권한 확인 중일 때 보여줄 화면
  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-gray-400 font-bold text-lg animate-pulse">관리자 권한 확인 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto flex h-[calc(100vh-64px)] border-t border-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-[#151b22] border-r border-gray-800 p-6 flex flex-col gap-6">
        <div className="text-white font-black text-xl tracking-tight">
          VALODUO <span className="text-[var(--valo-red)]">ADMIN</span>
        </div>
        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-800 p-3 rounded-lg transition-colors">
            <LayoutDashboard size={18} /> 대시보드
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-800 p-3 rounded-lg transition-colors">
            <Users size={18} /> 유저 및 정지 관리
          </Link>
          <Link href="/admin/reports" className="flex items-center gap-3 text-gray-300 hover:text-[var(--valo-red)] hover:bg-gray-800 p-3 rounded-lg transition-colors">
            <AlertTriangle size={18} /> 신고 접수 내역
          </Link>
          <Link href="/admin/news" className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-800 p-3 rounded-lg transition-colors">
            <FileText size={18} /> 뉴스/가이드 작성
          </Link>
        </nav>
        <div className="mt-auto">
          <Link href="/" className="flex items-center gap-3 text-gray-500 hover:text-white p-3 rounded-lg transition-colors">
            <ArrowLeft size={18} /> 일반 사이트로
          </Link>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#0f1419] p-8">
        {children}
      </div>
    </div>
  );
}
