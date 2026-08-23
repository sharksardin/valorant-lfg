"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function PostList({ session }: { session: any }) {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, payload => {
        fetchPosts(); // INSERT, DELETE 등 변경사항 발생 시 즉시 반영
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

  const handleDelete = async (postId: string) => {
    if (!confirm("정말 이 구인 글을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) alert("삭제 실패: " + error.message);
  };

  const router = useRouter();

  const handleChat = async (postAuthorId: string) => {
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (session.user.id === postAuthorId) {
      alert("본인에게는 채팅을 보낼 수 없습니다.");
      return;
    }

    // 발로란트 계정 연동(프로필 존재) 여부 확인
    const { data: myProfile } = await supabase.from('profiles').select('id').eq('id', session.user.id).single();
    if (!myProfile) {
      alert("먼저 발로란트 계정을 연동해야 채팅을 시작할 수 있습니다!");
      return;
    }

    // 1. 기존 채팅방 찾기
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

    // 2. 없으면 새로 생성
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

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div key={post.id} className="bg-[#1a232c] border border-gray-800 rounded-lg p-5 hover:border-gray-600 transition-colors shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center font-bold text-xl text-white overflow-hidden">
                {post.profiles?.avatar_url ? (
                  <img src={post.profiles.avatar_url} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  post.profiles?.valorant_tier?.charAt(0) || "?"
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {post.profiles?.riot_id?.split("#")[0] || post.profiles?.discord_name || "Unknown"}
                  <span className="text-gray-500 text-sm font-normal">#{post.profiles?.riot_id?.split("#")[1] || "0000"}</span>
                </h3>
                <p className="text-[var(--valo-red)] font-semibold text-sm">{post.profiles?.valorant_tier || "Unranked"}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-gray-500 text-sm">
                {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
              {session?.user?.id === post.author_id && (
                <button 
                  onClick={() => handleDelete(post.id)}
                  className="text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium bg-red-500/10 px-2 py-1 rounded"
                >
                  <Trash2 size={14} />
                  삭제
                </button>
              )}
            </div>
          </div>
          
          <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.memo}</p>
          
          <div className="flex justify-between items-end">
            <div className="flex gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <span className="text-white font-medium">요원:</span> {post.agents?.join(", ")}
              </div>
              <div className="flex items-center gap-1">
                {post.mic ? <Mic size={16} className="text-green-400"/> : <MicOff size={16} className="text-red-400"/>}
                {post.mic ? "마이크 O" : "마이크 X"}
              </div>
              <div>
                <span className="text-white font-medium">시간:</span> {post.play_time}
              </div>
            </div>
            <button 
              onClick={() => handleChat(post.author_id)}
              className="bg-white text-black px-4 py-2 rounded font-bold hover:bg-gray-200 transition-colors shadow-md"
            >
              채팅 보내기
            </button>
          </div>
        </div>
      ))}
      {posts.length === 0 && (
        <div className="text-center text-gray-500 py-10 bg-[#1a232c] rounded-lg border border-gray-800">
          아직 올라온 구인 글이 없습니다. 첫 번째 글을 작성해 보세요!
        </div>
      )}
    </div>
  );
}
