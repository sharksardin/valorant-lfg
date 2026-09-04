"use client";

import { useEffect, useState } from "react";
import { User, LogOut, Settings } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LoginButton() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
        <button 
          onClick={handleLogout}
          className="text-gray-400 hover:text-white transition-colors"
          title="로그아웃"
        >
          <LogOut size={18} />
        </button>
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
