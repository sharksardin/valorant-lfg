"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Trash2, X, MessageCircle, Flame } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function PostList({ session }: { session: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, payload => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles (
          discord_name,
          avatar_url,
          riot_id,
          valorant_tier
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data || []);
    }
  };

  const handleChat = async (postAuthorId: string) => {
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (session.user.id === postAuthorId) {
      alert("본인에게는 채팅을 보낼 수 없습니다.");
      return;
    }

    const { data: myProfile } = await supabase.from('profiles').select('id').eq('id', session.user.id).single();
    if (!myProfile) {
      alert("먼저 발로란트 계정을 연동해야 채팅을 시작할 수 있습니다!");
      return;
    }

    const [u1, u2] = [session.user.id, postAuthorId].sort();
    
    const { data: existingChats } = await supabase
      .from('chats')
      .select('id')
      .eq('user1_id', u1)
      .eq('user2_id', u2)
      .maybeSingle();

    if (existingChats) {
      router.push(`/chat?id=${existingChats.id}`);
      return;
    }

    const { data: newChat, error } = await supabase
      .from('chats')
      .insert({ user1_id: u1, user2_id: u2 })
      .select()
      .single();

    if (error) {
      alert("채팅방 생성 실패: " + error.message);
      return;
    }

    router.push(`/chat?id=${newChat.id}`);
  };

  const handlePass = () => {
    setCurrentIndex(prev => prev + 1);
  };

  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-20 bg-[#1a232c] rounded-lg border border-gray-800">
        아직 올라온 구인 글이 없습니다. 첫 번째 글을 작성해 보세요!
      </div>
    );
  }

  if (currentIndex >= posts.length) {
    return (
      <div className="text-center py-20 bg-[#1a232c] rounded-lg border border-gray-800 flex flex-col items-center justify-center">
        <h3 className="text-2xl font-bold text-white mb-2">모든 듀오를 다 확인했습니다!</h3>
        <p className="text-gray-400 mb-6">잠시 후 다시 방문하거나 새로운 글을 작성해보세요.</p>
        <button onClick={() => setCurrentIndex(0)} className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 font-bold transition-colors">
          처음부터 다시 보기
        </button>
      </div>
    );
  }

  const post = posts[currentIndex];
  const riotIdStr = post.profiles?.riot_id || "Unknown#0000";
  const [riotName, riotTag] = riotIdStr.split("#");
  const isMe = session?.user?.id === post.author_id;

  return (
    <div className="flex flex-col items-center justify-center py-4">
      {/* 틴더 스타일 매칭 카드 */}
      <div className="bg-[#1a232c] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-800 transition-all duration-300 transform">
        
        {/* 상단 프로필 영역 (배경) */}
        <div className="h-40 bg-gradient-to-b from-gray-800 to-[#1a232c] relative flex flex-col items-center justify-end pb-8">
          {isMe && (
            <button 
              onClick={async () => {
                if (!confirm("내 글을 삭제할까요?")) return;
                await supabase.from("posts").delete().eq("id", post.id);
                // 삭제 후 인덱스가 범위를 벗어나지 않도록 처리
                if (currentIndex >= posts.length - 1 && currentIndex > 0) {
                  setCurrentIndex(prev => prev - 1);
                }
              }}
              className="absolute top-4 left-4 bg-red-500/20 text-red-400 p-2 rounded-full hover:bg-red-500/40 transition-colors"
              title="내 글 삭제하기"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* 매너 온도 표시 (임시 UI) */}
          <div className="absolute top-4 right-4 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1 border border-orange-500/30">
            <Flame size={14} /> 매너 36.5°C
          </div>

          <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center font-bold text-3xl text-white overflow-hidden border-4 border-[#1a232c] absolute -bottom-12 shadow-lg z-10">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="profile" className="w-full h-full object-cover" />
            ) : (
              post.profiles?.valorant_tier?.charAt(0) || "?"
            )}
          </div>
        </div>
        
        {/* 하단 상세 정보 영역 */}
        <div className="pt-16 pb-8 px-6 text-center flex flex-col items-center">
          <h3 className="text-2xl font-bold flex items-end gap-1 justify-center">
            {riotName} <span className="text-gray-500 text-base font-normal">#{riotTag}</span>
          </h3>
          <p className="text-[var(--valo-red)] font-extrabold text-lg mt-1 tracking-wide uppercase">
            {post.profiles?.valorant_tier || "Unranked"}
          </p>
          
          <div className="mt-6 flex flex-wrap justify-center gap-2 w-full">
            {post.playstyles?.map((tag: string, idx: number) => (
              <span key={`ps-${idx}`} className="bg-[var(--valo-red)]/20 text-[var(--valo-red)] px-4 py-1.5 rounded-full text-sm font-bold border border-[var(--valo-red)]/30">
                {tag}
              </span>
            ))}
            <span className="bg-gray-800/50 text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium border border-gray-700/50">
              {post.mic ? "🎙️ 마이크 O" : "🔇 마이크 X"}
            </span>
            <span className="bg-gray-800/50 text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium border border-gray-700/50">
              ⏰ {post.play_time || "시간 무관"}
            </span>
            {post.agents?.map((agent: string, idx: number) => (
              <span key={idx} className="bg-gray-800/50 text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium border border-gray-700/50">
                🎮 {agent}
              </span>
            ))}
          </div>
          
          <div className="mt-8 bg-gray-900/50 w-full p-4 rounded-xl border border-gray-800/50 text-gray-300 text-sm min-h-[80px] flex items-center justify-center italic">
            "{post.memo}"
          </div>
        </div>
      </div>
      
      {/* 액션 버튼 영역 */}
      <div className="flex gap-8 mt-10">
        <button 
          onClick={handlePass} 
          className="w-16 h-16 rounded-full bg-[#1a232c] border-2 border-gray-700 text-gray-400 flex items-center justify-center hover:bg-gray-800 hover:text-white hover:border-gray-500 transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          <X size={32} />
        </button>
        <button 
          onClick={() => handleChat(post.author_id)} 
          className="w-16 h-16 rounded-full bg-[var(--valo-red)] text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(255,70,85,0.4)] hover:scale-105 active:scale-95"
        >
          <MessageCircle size={32} />
        </button>
      </div>

      <p className="text-gray-600 text-sm mt-8">
        {currentIndex + 1} / {posts.length} 명의 대기열
      </p>
    </div>
  );
}
