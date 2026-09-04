"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Trash2, AlertTriangle, ThumbsUp, ThumbsDown, Info } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getTierColor } from "@/lib/utils";

function ChatContent() {
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get("id");
  
  const [session, setSession] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  useEffect(() => {
    if (session) {
      fetchChats();
    }
  }, [session]);

  // 사이드바 안읽음 카운트 실시간 업데이트 (현재 안 보고 있는 방에 새 메시지가 왔을 때)
  useEffect(() => {
    if (session) {
      const globalChannel = supabase
        .channel('chat_unread_counts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
           if (payload.new.sender_id !== session.user.id && payload.new.chat_id !== activeChatId) {
             setUnreadCounts(prev => ({ ...prev, [payload.new.chat_id]: (prev[payload.new.chat_id] || 0) + 1 }));
           }
        })
        .subscribe();
      return () => {
        supabase.removeChannel(globalChannel);
      }
    }
  }, [session, activeChatId]);

  useEffect(() => {
    if (session && activeChatId) {
      fetchMessages(activeChatId);
      
      const channel = supabase
        .channel(`chat:${activeChatId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChatId}` }, payload => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new]);
            // 방을 보고 있을 때 새 메시지가 오면 즉시 읽음 처리
            if (payload.new.sender_id !== session.user.id) {
               supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id).then();
            }
          } else if (payload.eventType === 'UPDATE') {
            // 상대방이 읽어서 is_read가 true로 바뀌는 이벤트 반영
            setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session, activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    const { data: chatData } = await supabase
      .from('chats')
      .select('*, user1:user1_id(discord_name, avatar_url, riot_id, valorant_tier), user2:user2_id(discord_name, avatar_url, riot_id, valorant_tier)')
      .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`);
    
    if (chatData) {
      setChats(chatData);
      
      // 각 채팅방별 안 읽은 메시지 개수 가져오기
      const chatIds = chatData.map(c => c.id);
      if (chatIds.length > 0) {
        const { data: unreadData } = await supabase
          .from('messages')
          .select('chat_id')
          .in('chat_id', chatIds)
          .eq('is_read', false)
          .neq('sender_id', session.user.id);
          
        const counts: Record<string, number> = {};
        unreadData?.forEach(msg => {
          counts[msg.chat_id] = (counts[msg.chat_id] || 0) + 1;
        });
        setUnreadCounts(counts);
      }
    }
  };

  const fetchMessages = async (chatId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data);
      
      // 이 방에 들어왔으므로, 안 읽은 메시지들을 모두 '읽음(is_read: true)'으로 업데이트
      const unreadIds = data.filter(m => !m.is_read && m.sender_id !== session.user.id).map(m => m.id);
      if (unreadIds.length > 0) {
        await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
        setUnreadCounts(prev => ({ ...prev, [chatId]: 0 }));
      }
    }
  };

  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId || !session || isSending) return;
    
    setIsSending(true);
    const content = newMessage;
    setNewMessage(""); 

    const { error } = await supabase.from('messages').insert({
      chat_id: activeChatId,
      sender_id: session.user.id,
      content: content,
      is_read: false
    });

    if (error) {
      console.error("Message send error:", error);
      alert("메시지 전송에 실패했습니다. (너무 빠르게 보내고 있거나 권한이 없습니다.)");
    }
    
    // 약간의 쿨타임(0.5초) 후 다시 전송 가능하게 함 (프론트엔드 도배 방어)
    setTimeout(() => {
      setIsSending(false);
    }, 500);
  };

  if (!session) return <div className="text-center py-20 text-gray-400">로그인이 필요합니다.</div>;

  return (
    <div className="max-w-6xl mx-auto flex h-[calc(100vh-64px)] p-4 gap-4">
      {/* Sidebar */}
      <div className="w-1/3 bg-[#1a232c] border border-gray-800 rounded-lg flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-800 font-bold text-lg text-white">내 채팅방</div>
        <div className="overflow-y-auto flex-1">
          {chats.map(chat => {
            const isUser1 = chat.user1_id === session.user.id;
            const partner = isUser1 ? chat.user2 : chat.user1;
            const isActive = chat.id === activeChatId;
            const unreadCount = unreadCounts[chat.id] || 0;
            
            return (
              <a 
                key={chat.id} 
                href={`/chat?id=${chat.id}`}
                className={`flex items-center gap-3 p-4 border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors ${isActive ? 'bg-gray-800/80' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold overflow-hidden relative">
                   {partner?.avatar_url ? <img src={partner.avatar_url} /> : (partner?.valorant_tier?.charAt(0) || "?")}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-bold text-white text-sm">{partner?.riot_id?.split("#")[0] || partner?.discord_name}</span>
                  <span className={`${getTierColor(partner?.valorant_tier)} text-xs font-bold`}>{partner?.valorant_tier || "Unranked"}</span>
                </div>
                {unreadCount > 0 && (
                  <div className="bg-[var(--valo-red)] text-white text-xs font-bold min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </div>
                )}
              </a>
            );
          })}
          {chats.length === 0 && <div className="p-4 text-gray-500 text-sm text-center mt-10">진행 중인 대화가 없습니다.</div>}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-[#1a232c] border border-gray-800 rounded-lg flex flex-col overflow-hidden relative">
        {activeChatId ? (
          <>
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a232c] z-10 shadow-sm">
              <span className="font-bold text-white flex items-center gap-2">대화방</span>
              <div className="flex items-center gap-2">
                {(() => {
                  // 현재 채팅방의 상태 및 권한 계산
                  const currentChat = chats.find(c => c.id === activeChatId);
                  const partnerId = currentChat?.user1_id === session.user.id ? currentChat?.user2_id : currentChat?.user1_id;
                  
                  // 내가 보낸 메시지 갯수와 상대가 보낸 메시지 갯수
                  const myMsgs = messages.filter(m => m.sender_id === session.user.id).length;
                  const partnerMsgs = messages.filter(m => m.sender_id === partnerId).length;
                  const canRate = myMsgs > 0 && partnerMsgs > 0;

                  return (
                    <button 
                      onClick={async () => {
                        if (!canRate) {
                          alert("글쓴이와 신청자 모두 1번 이상 메시지를 보내야 서로를 평가할 수 있습니다!");
                          return;
                        }
                        
                        // 이미 평가했는지 확인
                        const { data: existingRating } = await supabase
                          .from('user_ratings')
                          .select('id')
                          .eq('rater_id', session.user.id)
                          .eq('rated_id', partnerId)
                          .maybeSingle();
                          
                        if (existingRating) {
                          alert("이미 이 유저를 평가하셨습니다.");
                          return;
                        }

                        const isGood = confirm("이 유저와의 게임(대화)이 즐거우셨나요?\n[확인] 좋았어요 (+0.5도)\n[취소] 별로예요 (-0.5도)\n\n※ 평가는 한 번만 가능하며 취소할 수 없습니다.");
                        const score = isGood ? 0.5 : -0.5;
                        
                        const { error } = await supabase.from('user_ratings').insert({
                          rater_id: session.user.id,
                          rated_id: partnerId,
                          score: score
                        });
                        
                        if (error) {
                          alert("평가 중 에러가 발생했습니다: " + error.message);
                        } else {
                          alert("소중한 평가가 반영되었습니다!");
                        }
                      }}
                      className={`text-xs font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded border ${
                        canRate 
                          ? 'text-gray-300 hover:text-green-400 border-gray-700 hover:border-green-400/50' 
                          : 'text-gray-600 border-gray-800 cursor-not-allowed'
                      }`}
                      title={canRate ? "매너 평가하기" : "쌍방 대화 시 활성화됩니다"}
                    >
                      <ThumbsUp size={14} /> 평가
                    </button>
                  );
                })()}

                <button 
                  onClick={async () => {
                    const reason = prompt("신고 사유를 입력해주세요.\n(최근 대화 내용 5개가 관리자에게 자동으로 함께 전송됩니다.)");
                    if (!reason) return;

                    // 최근 5개 메시지 추출해서 첨부하기
                    const recentMsgs = messages.slice(-5).map(m => {
                      const speaker = m.sender_id === session.user.id ? "나" : "상대방";
                      return `${speaker}: ${m.content}`;
                    }).join('\n');

                    const partnerId = chats.find(c => c.id === activeChatId)?.user1_id === session.user.id 
                      ? chats.find(c => c.id === activeChatId)?.user2_id 
                      : chats.find(c => c.id === activeChatId)?.user1_id;

                    const fullReason = `[채팅 신고] ${reason}\n\n[최근 대화 내용]\n${recentMsgs}`;

                    const { error } = await supabase.from('reports').insert({
                      reporter_id: session.user.id,
                      reported_id: partnerId,
                      reason: fullReason
                    });
                    
                    if (error) {
                      alert("신고 접수 중 에러가 발생했습니다: " + error.message);
                    } else {
                      alert("신고가 접수되었습니다. 관리자가 대화 내용을 검토 후 조치하겠습니다.");
                    }
                  }}
                  className="text-gray-400 hover:text-orange-400 text-xs font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded border border-gray-700 hover:border-orange-400/50"
                >
                  <AlertTriangle size={14} /> 신고
                </button>
                
                <button 
                  onClick={async () => {
                    if(!confirm("채팅방을 나가시겠습니까? 양쪽 모두에게서 대화 내용이 삭제됩니다.")) return;
                    await supabase.from('chats').delete().eq('id', activeChatId);
                    window.location.href = '/chat';
                  }}
                  className="text-gray-400 hover:text-red-400 text-xs font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded border border-gray-700 hover:border-red-400/50"
                >
                  <Trash2 size={14} /> 나가기
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-3 text-center text-xs text-blue-300">
                <Info size={14} className="inline mr-1 -mt-0.5" />
                서로 한 번씩 이상 대화를 나누면 우측 상단의 <b>매너 평가</b> 버튼이 활성화됩니다.
              </div>
              {messages.map(msg => {
                const isMe = msg.sender_id === session.user.id;
                const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* 말풍선 */}
                      <div className={`px-4 py-2 text-sm rounded-2xl ${isMe ? 'bg-[var(--valo-red)] text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                        {msg.content}
                      </div>
                      
                      {/* 상태 정보 (시간 및 읽음 표시) */}
                      <div className={`flex flex-col text-[10px] text-gray-500 ${isMe ? 'items-end' : 'items-start'}`}>
                        {isMe && !msg.is_read && <span className="text-[var(--valo-red)] font-bold">1</span>}
                        <span>{timeStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="메시지를 입력하세요..." 
                className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white text-sm outline-none focus:border-[var(--valo-red)]"
              />
              <button type="submit" className="bg-[var(--valo-red)] text-white p-2 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            좌측에서 채팅방을 선택하거나, 파티 찾기에서 대화를 시작해보세요.
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
