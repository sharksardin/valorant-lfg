"use client";

import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
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


      <PostList session={session} />

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        session={session} 
      />
    </div>
  );
}
