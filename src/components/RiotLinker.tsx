"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const VALORANT_TIERS = [
  "Iron", "Bronze", "Silver", "Gold", 
  "Platinum", "Diamond", "Ascendant", 
  "Immortal", "Radiant"
];

export default function RiotLinker({ session }: { session: any }) {
  const [riotName, setRiotName] = useState("");
  const [riotTag, setRiotTag] = useState("");
  const [selectedTier, setSelectedTier] = useState("Gold");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    if (data) {
      setProfile(data);
      if (data.valorant_tier) {
        setSelectedTier(data.valorant_tier);
      }
    }
  };

  const handleLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!session) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/riot/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: riotName || profile?.riot_id?.split("#")[0],
          tag: riotTag || profile?.riot_id?.split("#")[1],
          tier: selectedTier,
          userId: session.user.id,
          discordName: session.user.user_metadata.full_name || session.user.email,
          avatarUrl: session.user.user_metadata.avatar_url,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 성공 시 프로필 다시 불러오기
      await fetchProfile();
    } catch (err: any) {
      setError(err.message || "알 수 없는 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="bg-[#1a232c] border border-gray-800 rounded-lg p-6 mb-8 shadow-sm">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        발로란트 계정 연동 및 티어 설정
      </h2>
      
      {profile ? (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <p className="text-gray-400 text-sm">연동된 계정</p>
              <p className="font-bold text-lg">{profile.riot_id}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleLink}
              disabled={loading}
              className="bg-gray-800 text-gray-300 py-2 px-4 rounded font-bold hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> {loading ? "가져오는 중..." : "전적/랭크 갱신"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleLink} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-400 text-sm mb-1">라이엇 ID (닉네임)</label>
              <input 
                required type="text" placeholder="예: JettMain"
                value={riotName} onChange={e => setRiotName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-[var(--valo-red)]"
              />
            </div>
            <div className="w-full md:w-32">
              <label className="block text-gray-400 text-sm mb-1">태그 (# 제외)</label>
              <input 
                required type="text" placeholder="예: KR1"
                value={riotTag} onChange={e => setRiotTag(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-[var(--valo-red)]"
              />
            </div>
            <div className="w-full md:w-40">
              <label className="block text-gray-400 text-sm mb-1">현재 티어</label>
              <select 
                value={selectedTier} onChange={e => setSelectedTier(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-[var(--valo-red)]"
              >
                {VALORANT_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          
          {error && <div className="text-red-400 flex items-center gap-1 text-sm"><AlertCircle size={14}/> {error}</div>}
          
          <button 
            type="submit" disabled={loading}
            className="bg-[var(--valo-red)] text-white px-6 py-2 rounded font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? "인증 중..." : "계정 연동 및 티어 저장"}
          </button>
        </form>
      )}
    </div>
  );
}
