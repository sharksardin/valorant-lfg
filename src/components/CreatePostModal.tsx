"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const AVAILABLE_TAGS = [
  "🔥 빡겜", "😆 즐겜", "⚔️ 공격적인 불도저", "🛡️ 든든한 백업", 
  "📣 오더 선호", "🚫 한숨/남탓 금지", "📝 피드백 환영", "✨ 텐션 높게"
];

export default function CreatePostModal({ isOpen, onClose, session }: { isOpen: boolean, onClose: () => void, session: any }) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [mic, setMic] = useState(true);
  const [time, setTime] = useState("저녁");
  const [memo, setMemo] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [gameMode, setGameMode] = useState("경쟁전");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && session) {
      const fetchMyPost = async () => {
        const { data } = await supabase
          .from('posts')
          .select('*')
          .eq('author_id', session.user.id)
          .maybeSingle();

        if (data) {
          setSelectedRoles(data.agents || []);
          setMic(data.mic ?? true);
          setTime(data.play_time || "저녁");
          setMemo(data.memo || "");
          setSelectedTags(data.playstyles || []);
          setGameMode(data.game_mode || "경쟁전");
          setIsEditing(true);
          setLastUpdatedAt(data.updated_at || data.created_at);
        } else {
          setSelectedRoles([]);
          setMic(true);
          setTime("저녁");
          setMemo("");
          setSelectedTags([]);
          setGameMode("경쟁전");
          setIsEditing(false);
          setLastUpdatedAt(null);
        }
      };
      fetchMyPost();
    }
  }, [isOpen, session]);

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

    if (selectedRoles.length === 0) {
      alert("선호 역할군을 최소 1개 이상 선택해주세요.");
      setLoading(false);
      return;
    }

    if (isEditing && lastUpdatedAt) {
      const timeAgo = Math.floor((new Date().getTime() - new Date(lastUpdatedAt).getTime()) / 60000);
      if (timeAgo < 15) {
        alert(`글 수정 및 끌어올리기는 15분마다 가능합니다. (${15 - timeAgo}분 남음)`);
        setLoading(false);
        return;
      }
    }

    // 유저당 1개의 글만 유지 (upsert)
    const { error } = await supabase
      .from("posts")
      .upsert({
        author_id: session.user.id,
        agents: selectedRoles, // DB 호환성을 위해 agents 컬럼 재사용
        mic: mic,
        play_time: time,
        memo: memo,
        playstyles: selectedTags,
        game_mode: gameMode,
        updated_at: new Date().toISOString()
      }, { onConflict: 'author_id' });

    setLoading(false);
    
    if (error) {
      alert("글 작성 실패: " + error.message);
    } else {
      setSelectedRoles([]);
      setTime("저녁");
      setMemo("");
      setMic(true);
      setSelectedTags([]);
      setGameMode("경쟁전");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a232c] border border-gray-700 rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{isEditing ? "내 구인 글 수정/끌어올리기" : "듀오/팀원 구인 글 작성"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-gray-400 text-sm mb-2">게임 모드</label>
            <div className="flex flex-wrap gap-2">
              {["경쟁전", "일반전", "신속플레이", "데스매치"].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setGameMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors border ${
                    gameMode === mode
                      ? 'bg-[var(--valo-red)] text-white border-transparent' 
                      : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          
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
            <label className="block text-gray-400 text-sm mb-2">선호 역할군 <span className="text-[var(--valo-red)]">(다중 선택 가능)</span></label>
            <div className="flex flex-wrap gap-2">
              {["타격대", "척후대", "감시자", "전략가", "올라운더"].map(role => {
                const isSelected = selectedRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      if (isSelected) setSelectedRoles(prev => prev.filter(r => r !== role));
                      else setSelectedRoles(prev => [...prev, role]);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      isSelected 
                        ? 'bg-[var(--valo-red)] text-white border-transparent' 
                        : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">주 플레이 시간대</label>
            <div className="flex flex-wrap gap-2">
              {["새벽", "오전", "오후", "저녁", "심야", "주말", "시간 무관"].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTime(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    time === t
                      ? 'bg-[var(--valo-red)] text-white border-transparent' 
                      : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
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
            {loading ? "처리 중..." : (isEditing ? "수정하고 끌어올리기" : "등록하기")}
          </button>
        </form>
      </div>
    </div>
  );
}
