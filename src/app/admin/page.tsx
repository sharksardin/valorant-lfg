"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    reports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // 병렬로 세 가지 쿼리를 동시에 실행해서 속도 최적화
      const [
        { count: usersCount },
        { count: postsCount },
        { count: reportsCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        users: usersCount || 0,
        posts: postsCount || 0,
        reports: reportsCount || 0
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-white mb-8">대시보드 홈</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1a232c] p-6 rounded-xl border border-gray-800 shadow-lg">
          <h3 className="text-gray-400 text-sm font-bold mb-2">총 가입 유저</h3>
          <p className="text-3xl text-white font-bold">
            {loading ? "..." : stats.users.toLocaleString()} <span className="text-lg text-gray-500 font-normal">명</span>
          </p>
        </div>
        <div className="bg-[#1a232c] p-6 rounded-xl border border-gray-800 shadow-lg">
          <h3 className="text-gray-400 text-sm font-bold mb-2">현재 진행중인 구인 글</h3>
          <p className="text-3xl text-white font-bold">
            {loading ? "..." : stats.posts.toLocaleString()} <span className="text-lg text-gray-500 font-normal">개</span>
          </p>
        </div>
        <div className="bg-[#1a232c] p-6 rounded-xl border border-gray-800 shadow-lg">
          <h3 className="text-[var(--valo-red)] text-sm font-bold mb-2">미처리 누적 신고</h3>
          <p className="text-3xl text-[var(--valo-red)] font-bold">
            {loading ? "..." : stats.reports.toLocaleString()} <span className="text-lg text-[var(--valo-red)]/50 font-normal">건</span>
          </p>
        </div>
      </div>
      
      <div className="bg-[#1a232c] p-8 rounded-xl border border-gray-800 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          👋 환영합니다, 최고 관리자님!
        </h2>
        <div className="text-gray-400 space-y-4 leading-relaxed">
          <p>
            발로듀오(VALODUO) 통합 백오피스입니다.<br/>
            현재 상단의 통계 데이터는 실시간으로 데이터베이스에서 불러오고 있습니다.
          </p>
          <ul className="list-disc list-inside bg-gray-900/50 p-4 rounded border border-gray-800 text-gray-300">
            <li><span className="text-white">유저 및 정지 관리:</span> 악성 유저 영구 정지 (완료)</li>
            <li><span className="text-white">신고 접수 내역:</span> 채팅 로그 검토 및 처리 (완료)</li>
            <li><span className="text-white">뉴스/가이드 작성:</span> 웹에서 직접 공지사항 발행 (다음 개발 목표)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
