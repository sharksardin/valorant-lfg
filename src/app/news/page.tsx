"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, BookOpen, Newspaper } from "lucide-react";

export default function NewsPage() {
  const [officialNews, setOfficialNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 애드센스 심사용 고정 가이드 글 (자체 콘텐츠)
  const guides = [
    {
      id: "1",
      title: "초보자를 위한 발로란트 에임 향상 가이드",
      summary: "에임 트래킹과 플릭샷, 크로스헤어 배치 등 발로란트에서 살아남기 위한 가장 기초적이고 필수적인 에임 꿀팁을 정리했습니다.",
      date: "2023. 10. 27."
    },
    {
      id: "2",
      title: "경쟁전 티어 올리는 포지션별 완벽 공략",
      summary: "타격대, 척후대, 감시자, 전략가 등 각 요원 포지션이 팀 승리를 위해 해야 할 핵심 역할과 승률을 높이는 플레이 방식을 소개합니다.",
      date: "2023. 10. 28."
    },
    {
      id: "3",
      title: "발로란트 맵별 승률 높은 추천 요원 조합",
      summary: "어센트, 바인드, 스플릿 등 주요 맵에서 프로게이머들이 가장 많이 사용하는 1티어 요원 조합과 그 이유를 분석해 드립니다.",
      date: "2023. 10. 29."
    }
  ];

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchOfficialNews = async () => {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        
        if (res.ok && data.status === 200) {
          setOfficialNews(data.data.slice(0, 6));
        } else {
          setErrorMsg(data.error || "뉴스를 불러오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("Failed to fetch official news:", error);
        setErrorMsg("API 서버와 통신할 수 없습니다.");
      }
      setLoading(false);
    };

    fetchOfficialNews();
  }, []);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <h1 className="text-3xl font-bold text-white mb-2">발로란트 정보</h1>
      <p className="text-gray-400 mb-10">게임 꿀팁과 실시간 공식 패치노트를 확인하세요.</p>

      {/* 1. 애드센스 승인용 자체 콘텐츠 (가이드) */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-3">
          <BookOpen size={20} className="text-[var(--valo-red)]" /> 발로듀오 꿀팁 가이드
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <Link 
              key={guide.id} 
              href={`/news/${guide.id}`}
              className="bg-[#1a232c] border border-gray-800 rounded-xl p-6 hover:border-[var(--valo-red)] transition-colors flex flex-col h-full group"
            >
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[var(--valo-red)] transition-colors line-clamp-2">
                {guide.title}
              </h3>
              <p className="text-sm text-gray-400 mb-6 line-clamp-3 flex-1 leading-relaxed">
                {guide.summary}
              </p>
              <div className="text-xs text-gray-600 font-medium">
                {guide.date}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. 자동화된 실시간 공식 뉴스 (HenrikDev API 연동) */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-3">
          <Newspaper size={20} className="text-[var(--valo-red)]" /> 실시간 공식 패치노트 & 뉴스
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            <div className="animate-pulse flex items-center gap-2">뉴스를 불러오는 중...</div>
          </div>
        ) : errorMsg ? (
          <div className="bg-[#1a232c] border border-gray-800 rounded-xl p-10 text-center text-gray-500">
            <p className="text-[var(--valo-red)] font-bold mb-2">API 에러 발생</p>
            <p>{errorMsg}</p>
            <p className="text-xs mt-4 opacity-50">.env.local 파일에 HENRIK_API_KEY를 설정했는지 확인해주세요.</p>
          </div>
        ) : officialNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {officialNews.map((news, idx) => (
              <a 
                key={idx}
                href={news.external_link || news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1a232c] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all group flex flex-col"
              >
                {news.banner_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={news.banner_url} 
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-[var(--valo-red)] bg-red-950/30 px-2 py-1 rounded">
                      {news.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      공식 홈페이지 <ExternalLink size={12} />
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-gray-300 transition-colors line-clamp-2">
                    {news.title}
                  </h3>
                  <div className="mt-auto text-xs text-gray-600 pt-4">
                    {new Date(news.date).toLocaleDateString()}
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="bg-[#1a232c] border border-gray-800 rounded-xl p-10 text-center text-gray-500">
            현재 뉴스를 불러올 수 없습니다.
          </div>
        )}
      </div>

    </div>
  );
}
