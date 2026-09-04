"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UserMinus } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const [session, setSession] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchBlocks(session.user.id);
      }
    });
  }, []);

  const fetchBlocks = async (userId: string) => {
    // 1. 차단 목록 먼저 가져오기 (외래키 이름 충돌을 피하기 위해 분리해서 조회)
    const { data: blocksData, error: blocksError } = await supabase
      .from('blocks')
      .select('*')
      .eq('blocker_id', userId)
      .order('created_at', { ascending: false });

    if (blocksError) {
      console.error("Fetch blocks error:", blocksError);
      return;
    }

    if (blocksData && blocksData.length > 0) {
      // 2. 차단된 유저들의 프로필 정보 가져오기
      const blockedIds = blocksData.map(b => b.blocked_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, riot_id, avatar_url')
        .in('id', blockedIds);

      // 3. 두 데이터 병합하기
      const merged = blocksData.map(block => ({
        ...block,
        profiles: profilesData?.find(p => p.id === block.blocked_id) || null
      }));
      
      setBlocks(merged);
    } else {
      setBlocks([]);
    }
  };

  const handleUnblock = async (blockId: string, blockedRiotId: string) => {
    if (!confirm(`'${blockedRiotId}' 유저의 차단을 해제하시겠습니까?`)) return;

    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', blockId);

    if (!error) {
      alert("차단이 해제되었습니다.");
      setBlocks(blocks.filter(b => b.id !== blockId));
    } else {
      console.error("Unblock Error:", error);
      alert(`차단 해제 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  if (!session) {
    return <div className="text-center py-20 text-gray-400">로그인이 필요한 페이지입니다.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-1 mb-8 w-fit transition-colors">
        <ArrowLeft size={16} /> 메인으로 돌아가기
      </Link>
      
      <h1 className="text-2xl font-bold text-white mb-6">설정 (차단 관리)</h1>
      
      <div className="bg-[#1a232c] border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">내가 차단한 유저 목록</h2>
        
        {blocks.length === 0 ? (
          <p className="text-gray-500 text-center py-10">차단한 유저가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {blocks.map((block) => {
              const riotId = block.profiles?.riot_id || "알 수 없는 유저";
              return (
                <div key={block.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    {block.profiles?.avatar_url ? (
                      <img src={block.profiles.avatar_url} alt="avatar" className="w-10 h-10 rounded-full border border-gray-700" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 text-gray-400">
                        ?
                      </div>
                    )}
                    <div>
                      <p className="text-white font-bold">{riotId}</p>
                      <p className="text-xs text-gray-500">{new Date(block.created_at).toLocaleDateString()} 차단됨</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleUnblock(block.id, riotId)}
                    className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded text-sm transition-colors"
                  >
                    <UserMinus size={14} /> 차단 해제
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
