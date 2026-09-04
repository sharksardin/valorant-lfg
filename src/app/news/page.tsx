import Link from "next/link";

const articles = [
  {
    id: "1",
    title: "발로란트 초보자를 위한 에임 향상 가이드: 크로스헤어 배치의 비밀",
    date: "2026-09-04",
    summary: "발로란트에서 가장 중요한 것은 반응 속도가 아니라 '크로스헤어 배치(헤드라인)'입니다. 초보자가 티어를 올리기 위해 반드시 알아야 할 에임 팁을 소개합니다."
  },
  {
    id: "2",
    title: "발로란트 9.0 패치노트 핵심 요약 및 현재 1티어 요원 분석",
    date: "2026-09-03",
    summary: "최근 진행된 대규모 패치 이후 메타가 어떻게 변했는지, 어떤 요원을 픽해야 경쟁전에서 유리한지 분석해 드립니다."
  },
  {
    id: "3",
    title: "경쟁전 연패 탈출을 위한 멘탈 관리법과 듀오의 중요성",
    date: "2026-09-01",
    summary: "팀 운이 없어서 연패 중이신가요? 멘탈을 관리하는 팁과 왜 나에게 딱 맞는 듀오를 구하는 것이 점수 상승에 필수적인지 알아봅니다."
  }
];

export default function NewsPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-white mb-2">발로란트 뉴스 & 팁</h1>
      <p className="text-gray-400 mb-8">발로란트 실력 향상을 위한 가이드와 최신 소식을 확인하세요.</p>
      
      <div className="space-y-4">
        {articles.map((article) => (
          <Link href={`/news/${article.id}`} key={article.id} className="block bg-[#1a232c] border border-gray-800 rounded-lg p-6 hover:border-[var(--valo-red)] transition-colors">
            <h2 className="text-xl font-bold text-white mb-2">{article.title}</h2>
            <p className="text-xs text-[var(--valo-red)] mb-3">{article.date}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{article.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
