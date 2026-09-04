"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, MessageCircle, AlertTriangle, Ban, Flame, Copy, ArrowUp, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

import { getTierColor } from "@/lib/utils";

export default function PostList({ session }: { session: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);
  
  // 필터 상태
  const [filterMode, setFilterMode] = useState<string>("전체");
  const [filterMic, setFilterMic] = useState<boolean | null>(null); // null = 무관
  const [filterRole, setFilterRole] = useState<string>("전체");
  
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetchBlocksAndPosts();
    } else {
      fetchPosts([]);
    }

    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, payload => {
        if (payload.eventType === 'DELETE') {
          if (session) fetchBlocksAndPosts(); else fetchPosts([]);
        } else if (payload.new && session && payload.new.author_id === session.user.id) {
          // 내가 쓴 글이 업데이트(끌어올리기 등) 되거나 생성된 경우 즉시 새로고침
          fetchBlocksAndPosts();
        } else {
          // 남이 쓴 글이면 버튼 띄우기
          setNewPostsAvailable(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, filterMode, filterMic, filterRole]); // 필터가 바뀔 때마다 재검색

  const fetchBlocksAndPosts = async () => {
    const { data: blocks } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', session.user.id);
    
    const bIds = blocks?.map(b => b.blocked_id) || [];
    setBlockedIds(bIds);
    fetchPosts(bIds);
  };

  const fetchPosts = async (bIds: string[]) => {
    let query = supabase
      .from("posts")
      .select(`
        *,
        profiles (
          discord_name,
          avatar_url,
          riot_id,
          valorant_tier,
          manner_score
        )
      `);

    // 필터 적용
    if (filterMode !== "전체") {
      query = query.eq('game_mode', filterMode);
    }
    if (filterMic !== null) {
      query = query.eq('mic', filterMic);
    }
    if (filterRole !== "전체") {
      query = query.overlaps('agents', [filterRole, "올라운더"]);
    }

    query = query.order("updated_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      const filtered = data?.filter(p => !bIds.includes(p.author_id)) || [];
      setPosts(filtered);
    }
  };

  const requireLogin = async () => {
    if (!session) {
      alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
      await supabase.auth.signInWithOAuth({ 
        provider: 'discord', 
        options: { redirectTo: window.location.origin } 
      });
      return false;
    }
    return true;
  };

  const handleChat = async (postAuthorId: string) => {
    if (!(await requireLogin())) return;
    
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

  const handleReport = async (reportedId: string) => {
    if (!(await requireLogin())) return;
    const reason = prompt("신고 사유를 간단히 적어주세요 (욕설, 도배 등):");
    if (!reason) return;

    const { error } = await supabase.from('reports').insert({
      reporter_id: session.user.id,
      reported_id: reportedId,
      reason: reason
    });
    
    if (error) {
      alert("신고 접수 중 에러가 발생했습니다: " + error.message);
    } else {
      alert("신고가 접수되었습니다. 관리자가 검토 후 조치하겠습니다.");
    }
  };

  const handleBlock = async (blockedId: string) => {
    if (!(await requireLogin())) return;
    if (!confirm("이 유저를 차단하시겠습니까? 앞으로 이 유저의 글이 보이지 않습니다.")) return;

    await supabase.from('blocks').insert({
      blocker_id: session.user.id,
      blocked_id: blockedId
    });
    
    alert("차단되었습니다.");
    fetchBlocksAndPosts(); // 리스트 갱신
  };

  return (
    <div className="space-y-6">
      
      {/* 🚀 상세 필터링 UI */}
      <div className="bg-[#1a232c] border border-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          🔍 맞춤 듀오 찾기
        </h3>
        <div className="space-y-4">
          
          {/* 게임 모드 필터 */}
          <div>
            <span className="text-gray-400 text-xs font-bold block mb-2">게임 모드</span>
            <div className="flex flex-wrap gap-2">
              {["전체", "경쟁전", "일반전", "신속플레이", "데스매치"].map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    filterMode === mode 
                      ? 'bg-[var(--valo-red)] text-white border-transparent' 
                      : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* 마이크 필터 */}
          <div>
            <span className="text-gray-400 text-xs font-bold block mb-2">마이크 사용</span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "무관", value: null }, 
                { label: "마이크 필수", value: true }, 
                { label: "마이크 X", value: false }
              ].map(mic => (
                <button
                  key={mic.label}
                  onClick={() => setFilterMic(mic.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    filterMic === mic.value 
                      ? 'bg-[var(--valo-red)] text-white border-transparent' 
                      : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:text-white'
                  }`}
                >
                  {mic.label}
                </button>
              ))}
            </div>
          </div>

          {/* 역할군 필터 */}
          <div>
            <span className="text-gray-400 text-xs font-bold block mb-2">필요한 역할군</span>
            <div className="flex flex-wrap gap-2">
              {["전체", "타격대", "척후대", "감시자", "전략가", "올라운더"].map(role => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    filterRole === role 
                      ? 'bg-[var(--valo-red)] text-white border-transparent' 
                      : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="space-y-4">
        {newPostsAvailable && (
          <button 
            onClick={() => {
              if (session) fetchBlocksAndPosts();
              else fetchPosts([]);
              setNewPostsAvailable(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full bg-[var(--valo-red)] hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all animate-bounce"
          >
            <ArrowUp size={18} /> 새로운 구인 글이 올라왔어요! 클릭해서 확인하기
          </button>
        )}

        {posts.length === 0 ? (
          <div className="text-center text-gray-500 py-20 bg-[#1a232c] rounded-lg border border-gray-800">
            조건에 맞는 구인 글이 없습니다.
          </div>
        ) : (
          posts.map(post => {
        const riotIdStr = post.profiles?.riot_id || "Unknown#0000";
        const [riotName, riotTag] = riotIdStr.split("#");
        const isMe = session?.user?.id === post.author_id;
        const timeAgo = Math.floor((new Date().getTime() - new Date(post.updated_at || post.created_at).getTime()) / 60000);

        return (
          <div key={post.id} className="bg-[#1a232c] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors flex flex-col md:flex-row gap-6 items-center">
            
            {/* 왼쪽: 프로필 */}
            <div className="flex flex-col items-center min-w-[120px]">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center font-bold text-xl text-white overflow-hidden border-2 border-gray-600 mb-2">
                {post.profiles?.avatar_url ? (
                  <img src={post.profiles.avatar_url} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  post.profiles?.valorant_tier?.charAt(0) || "?"
                )}
              </div>
              <div className="text-center">
                <p className="font-bold text-white leading-tight">{riotName}</p>
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                  #{riotTag}
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(riotIdStr);
                      alert("아이디가 복사되었습니다!");
                    }} 
                    className="hover:text-white transition-colors" 
                    title="라이엇 아이디 복사"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <p className={`${getTierColor(post.profiles?.valorant_tier)} font-bold text-xs mt-1`}>{post.profiles?.valorant_tier || "Unranked"}</p>
                <div className="mt-1.5 flex items-center justify-center gap-1 bg-gray-800/80 px-2 py-0.5 rounded-full border border-gray-700">
                  <span className="text-[10px] text-gray-400">매너</span>
                  <span className={`text-xs font-bold ${
                    (post.profiles?.manner_score || 36.5) >= 37.0 ? 'text-red-400' : 
                    (post.profiles?.manner_score || 36.5) <= 36.0 ? 'text-blue-400' : 'text-green-400'
                  }`}>
                    {(post.profiles?.manner_score || 36.5).toFixed(1)}°C
                  </span>
                </div>
              </div>
            </div>

            {/* 중앙: 상세 내용 */}
            <div className="flex-1 w-full">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-gray-800 text-white border border-gray-600 px-2 py-1 rounded text-xs font-bold">
                  🎮 {post.game_mode || "경쟁전"}
                </span>
                {post.playstyles?.map((tag: string, idx: number) => (
                  <span key={idx} className="bg-[var(--valo-red)]/20 text-[var(--valo-red)] px-2 py-1 rounded text-xs font-bold border border-[var(--valo-red)]/30">
                    {tag}
                  </span>
                ))}
                <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs font-medium">
                  {post.mic ? "🎙️ 마이크 O" : "🔇 마이크 X"}
                </span>
                <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs font-medium">
                  ⏰ {post.play_time || "시간 무관"}
                </span>
                {post.agents?.map((agent: string, idx: number) => (
                  <span key={`ag-${idx}`} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs font-medium">
                    🎮 {agent}
                  </span>
                ))}
              </div>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{post.memo}</p>
              <div className="text-xs text-gray-600 mt-3 flex items-center gap-2">
                <span>{timeAgo < 1 ? "방금 전" : `${timeAgo}분 전`}</span>
              </div>
            </div>

            {/* 오른쪽: 액션 버튼 */}
            <div className="flex md:flex-col gap-2 w-full md:w-auto">
              {isMe ? (
                <>
                  <button 
                    onClick={async () => {
                      if (timeAgo < 15) {
                        alert(`끌어올리기는 15분마다 가능합니다. (${15 - timeAgo}분 남음)`);
                        return;
                      }
                      await supabase.from("posts").update({ updated_at: new Date().toISOString() }).eq("id", post.id);
                      alert("글이 상단으로 끌어올려졌습니다!");
                    }}
                    className={`flex-1 md:w-full py-2 px-4 rounded text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                      timeAgo >= 15 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                    title={timeAgo >= 15 ? "내 글을 맨 위로 올리기" : "15분마다 가능합니다"}
                  >
                    <RefreshCw size={16} className={timeAgo >= 15 ? "" : "opacity-50"} /> 끌어올리기
                  </button>
                  <button 
                    onClick={async () => {
                      if (!confirm("내 글을 삭제할까요?")) return;
                      await supabase.from("posts").delete().eq("id", post.id);
                    }}
                    className="flex-1 md:w-full bg-gray-800 text-red-400 py-2 px-4 rounded hover:bg-gray-700 text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} /> 삭제
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleChat(post.author_id)} 
                    className="flex-1 md:w-full bg-[var(--valo-red)] text-white py-2 px-6 rounded hover:bg-red-600 text-sm font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} /> 대화하기
                  </button>
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => handleBlock(post.author_id)} className="flex-1 bg-gray-800 text-gray-400 py-1.5 px-2 rounded hover:bg-gray-700 hover:text-white text-xs flex items-center justify-center gap-1" title="차단하기">
                      <Ban size={14} /> 차단
                    </button>
                    <button onClick={() => handleReport(post.author_id)} className="flex-1 bg-gray-800 text-gray-400 py-1.5 px-2 rounded hover:bg-gray-700 hover:text-red-400 text-xs flex items-center justify-center gap-1" title="신고하기">
                      <AlertTriangle size={14} /> 신고
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        );
      })
        )}
      </div>
    </div>
  );
}
