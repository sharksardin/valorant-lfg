"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const AVAILABLE_TAGS = [
  "🔥 빡겜", "😆 즐겜", "⚔️ 공격적인 불도저", "🛡️ 든든한 백업", 
  "📣 오더 선호", "🚫 한숨/남탓 금지", "📝 피드백 환영", "✨ 텐션 높게"
];

export default function CreatePostModal({ isOpen, onClose, session }: { isOpen: boolean, onClose: () => void, session: any }) {
  const [agents, setAgents] = useState("");
  const [mic, setMic] = useState(true);
  const [time, setTime] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      if (selectedTags.length >= 3) {
        alert("태그는 최대 3개까지만 선택할 수 있습니다.");
        return;
      }
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        memo: memo,
        playstyles: selectedTags
      });

    setLoading(false);
    
    if (error) {
      alert("글 작성 실패: " + error.message);
    } else {
      setAgents("");
      setTime("");
      setMemo("");
      setMic(true);
      setSelectedTags([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a232c] border border-gray-700 rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">듀오/팀원 구인 글 작성</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">나의 성향 태그 <span className="text-[var(--valo-red)]">(최대 3개)</span></label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      isSelected 
                        ? 'bg-[var(--valo-red)] text-white border-transparent' 
                        : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

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
