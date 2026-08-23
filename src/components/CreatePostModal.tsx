"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function CreatePostModal({ isOpen, onClose, session }: { isOpen: boolean, onClose: () => void, session: any }) {
  const [agents, setAgents] = useState("");
  const [mic, setMic] = useState(true);
  const [time, setTime] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 발로란트 계정 연동(프로필 존재) 여부 확인
    const { data: myProfile } = await supabase.from('profiles').select('id').eq('id', session.user.id).single();
    if (!myProfile) {
      alert("먼저 발로란트 계정을 연동해야 구인 글을 작성할 수 있습니다!");
      setLoading(false);
      return;
    }
    
    const agentArray = agents.split(",").map(s => s.trim()).filter(s => s !== "");

    const { error } = await supabase
      .from("posts")
      .insert({
        author_id: session.user.id,
        agents: agentArray,
        mic: mic,
        play_time: time,
        memo: memo
      });

    setLoading(false);
    
    if (error) {
      alert("글 작성 실패: " + error.message);
    } else {
      // 폼 초기화 및 모달 닫기
      setAgents("");
      setTime("");
      setMemo("");
      setMic(true);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a232c] border border-gray-700 rounded-lg max-w-lg w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">듀오/팀원 구인 글 작성</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">선호 요원 (쉼표로 구분)</label>
            <input 
              required type="text" placeholder="예: 제트, 레이나, 오멘" 
              className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-[var(--valo-red)]"
              value={agents} onChange={e => setAgents(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">주 플레이 시간대</label>
            <input 
              required type="text" placeholder="예: 평일 저녁 8시~12시" 
              className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-[var(--valo-red)]"
              value={time} onChange={e => setTime(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" id="mic"
              checked={mic} onChange={e => setMic(e.target.checked)}
              className="w-4 h-4 accent-[var(--valo-red)] cursor-pointer"
            />
            <label htmlFor="mic" className="text-gray-400 text-sm cursor-pointer">마이크 사용 가능</label>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">상세 내용 (각오, 원하는 티어 등)</label>
            <textarea 
              required placeholder="빡겜하실 분 구합니다..." rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-[var(--valo-red)] resize-none"
              value={memo} onChange={e => setMemo(e.target.value)}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[var(--valo-red)] text-white py-3 rounded font-bold hover:bg-red-600 transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? "등록 중..." : "등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
