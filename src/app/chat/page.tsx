"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

function ChatContent() {
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get("id");
  
  const [session, setSession] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  useEffect(() => {
    if (session) {
      fetchChats();
    }
  }, [session]);

  useEffect(() => {
    if (session && activeChatId) {
      fetchMessages(activeChatId);
      
      const channel = supabase
        .channel(`chat:${activeChatId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChatId}` }, payload => {
          setMessages(prev => [...prev, payload.new]);
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
    const { data } = await supabase
      .from('chats')
      .select('*, user1:user1_id(discord_name, avatar_url, riot_id, valorant_tier), user2:user2_id(discord_name, avatar_url, riot_id, valorant_tier)')
      .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`);
    
    if (data) setChats(data);
  };

  const fetchMessages = async (chatId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId || !session) return;
    
    const content = newMessage;
    setNewMessage(""); 

    const { error } = await supabase.from('messages').insert({
      chat_id: activeChatId,
      sender_id: session.user.id,
      content: content
    });

    if (error) console.error("Message send error:", error);
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
            
            return (
              <a 
                key={chat.id} 
                href={`/chat?id=${chat.id}`}
                className={`flex items-center gap-3 p-4 border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors ${isActive ? 'bg-gray-800/80' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold overflow-hidden">
                   {partner?.avatar_url ? <img src={partner.avatar_url} /> : (partner?.valorant_tier?.charAt(0) || "?")}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-sm">{partner?.riot_id?.split("#")[0] || partner?.discord_name}</span>
                  <span className="text-xs text-[var(--valo-red)]">{partner?.valorant_tier || "Unranked"}</span>
                </div>
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => {
                const isMe = msg.sender_id === session.user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${isMe ? 'bg-[var(--valo-red)] text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                      {msg.content}
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
                className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white outline-none focus:border-[var(--valo-red)]"
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
