"use client";

import { useEffect, useState } from "react";
import { User, LogOut, Settings, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LoginButton() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('is_admin, is_banned').eq('id', userId).single();
      
      if (data?.is_banned) {
        alert("이용 약관 위반으로 영구 정지된 계정입니다.");
        await supabase.auth.signOut();
        window.location.href = "/";
        return;
      }
      
      if (data?.is_admin) setIsAdmin(true);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkAdminStatus(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });
    if (error) console.error("Login Error:", error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (session) {
    const user = session.user;
    return (
      <div className="flex items-center gap-4">
        <Link href="/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity" title="설정 (차단 관리)">
          {user.user_metadata.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="avatar" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center"><User size={16}/></div>
          )}
          <span className="text-white font-medium text-sm hidden sm:inline">{user.user_metadata.full_name}</span>
          <Settings size={16} className="text-gray-400 hover:text-white ml-1" />
        </Link>
        <div className="flex items-center gap-3 border-l border-gray-700 pl-4">
          {isAdmin && (
            <Link href="/admin" className="text-gray-400 hover:text-[var(--valo-red)] transition-colors" title="어드민 페이지">
              <ShieldAlert size={18} />
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors"
            title="로그아웃"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={handleLogin}
      className="bg-[var(--valo-red)] text-white px-4 py-2 rounded font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
    >
      <User size={16}/>
      디스코드로 로그인
    </button>
  );
}
