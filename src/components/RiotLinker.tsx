"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RiotLinker({ session }: { session: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    if (data) setProfile(data);
  };

  const handleLink = async () => {
    if (!name || !tag) return;
    setLoading(true);
    setError("");
    
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const token = currentSession?.access_token;
      
      const res = await fetch("/api/riot/verify", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          tag,
          userId: session.user.id,
          discordName: session.user.user_metadata.full_name,
          avatarUrl: session.user.user_metadata.avatar_url,
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      await fetchProfile(); // 연동 성공 시 프로필 다시 불러오기
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  if (profile) {
    return (
      <div className="bg-[#1a232c] border border-gray-800 rounded-lg p-6 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            내 발로란트 계정: <span className="text-white">{profile.riot_id}</span>
          </h2>
          <p className="text-[var(--valo-red)] font-semibold">{profile.valorant_tier}</p>
        </div>
        <div className="text-green-400 font-bold text-sm bg-green-400/10 px-3 py-1 rounded">
          인증 완료
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a232c] border border-[var(--valo-red)] rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold mb-2">발로란트 계정 연동이 필요합니다</h2>
      <p className="text-gray-400 mb-4 text-sm">구인 글을 작성하거나 채팅을 하려면 실제 티어 인증을 거쳐야 합니다.</p>
      
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="닉네임 (예: JettMain)" 
          className="flex-1 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-[var(--valo-red)]"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <span className="text-2xl text-gray-500 font-bold flex items-center">#</span>
        <input 
          type="text" 
          placeholder="태그 (예: KR1)" 
          className="w-24 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-[var(--valo-red)]"
          value={tag}
          onChange={e => setTag(e.target.value)}
        />
        <button 
          onClick={handleLink}
          disabled={loading}
          className="bg-[var(--valo-red)] text-white px-6 py-2 rounded font-bold hover:bg-red-600 transition-colors disabled:opacity-50 min-w-[100px]"
        >
          {loading ? "인증 중..." : "인증하기"}
        </button>
      </div>
      {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
    </div>
  );
}
