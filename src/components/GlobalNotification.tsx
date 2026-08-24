"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, X } from "lucide-react";

function NotificationLogic() {
  const [session, setSession] = useState<any>(null);
  const [notification, setNotification] = useState<{ id: string, content: string, chatId: string } | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    // Supabase RLS 정책에 의해 자신이 볼 수 있는(자신이 속한 채팅방의) 메시지만 수신됩니다.
    const channel = supabase
      .channel('global_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const newMessage = payload.new;
        
        // 내가 보낸 메시지가 아닐 때
        if (newMessage.sender_id !== session.user.id) {
          const activeChatId = searchParams.get("id");
          const isViewingChat = pathname === '/chat' && activeChatId === newMessage.chat_id;
          
          // 현재 그 채팅방을 보고 있지 않다면 알림을 띄움
          if (!isViewingChat) {
            setNotification({
              id: newMessage.id,
              content: newMessage.content,
              chatId: newMessage.chat_id
            });
            
            // 5초 후 자동 숨김
            setTimeout(() => {
              setNotification(null);
            }, 5000);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, pathname, searchParams]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#1a232c] border-2 border-[var(--valo-red)] rounded-lg shadow-2xl p-4 w-80 shadow-[0_0_15px_rgba(255,70,85,0.3)]">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 text-[var(--valo-red)] font-bold mb-2">
          <MessageSquare size={18} />
          <span>새로운 메시지 도착!</span>
        </div>
        <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-white">
          <X size={16} />
        </button>
      </div>
      <p className="text-gray-300 text-sm mb-4 truncate">{notification.content}</p>
      <button 
        onClick={() => {
          setNotification(null);
          router.push(`/chat?id=${notification.chatId}`);
        }}
        className="w-full bg-[var(--valo-red)] hover:bg-red-600 text-white font-bold text-sm py-2 rounded transition-colors"
      >
        채팅방으로 이동
      </button>
    </div>
  );
}

export default function GlobalNotification() {
  return (
    <Suspense fallback={null}>
      <NotificationLogic />
    </Suspense>
  );
}
