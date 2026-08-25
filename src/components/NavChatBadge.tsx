"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function NavChatBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkUnread(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkUnread(session.user.id);
      else setUnreadCount(0);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUnread = async (userId: string) => {
    // 내가 참여한 채팅방 찾기
    const { data: chats } = await supabase
      .from('chats')
      .select('id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
    
    if (chats && chats.length > 0) {
      const chatIds = chats.map(c => c.id);
      // 안 읽은 내 메시지 개수 조회
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('chat_id', chatIds)
        .eq('is_read', false)
        .neq('sender_id', userId);
        
      setUnreadCount(count || 0);
    }
  };

  useEffect(() => {
    if (!session) return;
    // 글로벌 메시지 리스너 (팝업 알림과 별개로 네비게이션 뱃지용)
    const channel = supabase
      .channel('nav_badge')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        if (payload.new.sender_id !== session.user.id) {
          checkUnread(session.user.id);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, payload => {
         // 읽음 처리되었을 때 갱신
         checkUnread(session.user.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  return (
    <Link href="/chat" className="hover:text-[var(--valo-red)] transition-colors flex items-center gap-1 relative">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      내 채팅
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-3 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[var(--valo-red)] text-[10px] items-center justify-center font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </span>
      )}
    </Link>
  );
}
