"use client";

import { useState, useEffect } from "react";
import { Search, PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import RiotLinker from "@/components/RiotLinker";
import CreatePostModal from "@/components/CreatePostModal";
import PostList from "@/components/PostList";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleOpenModal = () => {
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <RiotLinker session={session} />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">듀오/팀원 찾기</h1>
          <p className="text-gray-400">나와 딱 맞는 발로란트 파티원을 찾아보세요.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="bg-[var(--valo-red)] text-white px-5 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors flex items-center gap-2 shadow-lg"
        >
          <PlusCircle size={20} />
          구인글 작성
        </button>
      </div>

      {/* Filters (MVP에서는 디자인만 유지) */}
      <div className="bg-[#1a232c] p-4 rounded-lg mb-8 flex gap-4 border border-gray-800">
        <select className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-[var(--valo-red)]">
          <option>모든 티어</option>
          <option>Radiant ~ Ascendant</option>
          <option>Diamond ~ Platinum</option>
          <option>Gold ~ Iron</option>
        </select>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="챔피언, 닉네임, 메모 검색..." 
            className="w-full bg-gray-900 border border-gray-700 rounded pl-10 pr-4 py-2 text-white outline-none focus:border-[var(--valo-red)]"
          />
        </div>
      </div>

      <PostList session={session} />

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        session={session} 
      />
    </div>
  );
}
