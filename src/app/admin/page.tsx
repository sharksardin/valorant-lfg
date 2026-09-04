export default function AdminDashboard() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-white mb-8">대시보드 홈</h1>
      
      {/* 주요 통계 요약 (추후 실제 DB 데이터 연동 예정) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1a232c] p-6 rounded-xl border border-gray-800">
          <h3 className="text-gray-400 text-sm font-bold mb-2">총 가입 유저</h3>
          <p className="text-3xl text-white font-bold">-- 명</p>
        </div>
        <div className="bg-[#1a232c] p-6 rounded-xl border border-gray-800">
          <h3 className="text-gray-400 text-sm font-bold mb-2">현재 진행중인 구인 글</h3>
          <p className="text-3xl text-white font-bold">-- 개</p>
        </div>
        <div className="bg-[#1a232c] p-6 rounded-xl border border-gray-800">
          <h3 className="text-[var(--valo-red)] text-sm font-bold mb-2">미처리 누적 신고</h3>
          <p className="text-3xl text-white font-bold">-- 건</p>
        </div>
      </div>
      
      <div className="bg-[#1a232c] p-8 rounded-xl border border-gray-800 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          👋 환영합니다, 최고 관리자님!
        </h2>
        <div className="text-gray-400 space-y-4 leading-relaxed">
          <p>
            이곳은 발로듀오(VALODUO)의 전반적인 데이터를 한눈에 파악하고 악성 유저들을 처단(?)할 수 있는 <b>통합 백오피스 공간</b>입니다.
          </p>
          <p>
            현재는 어드민 페이지의 <b>'기본 뼈대와 사이드바 레이아웃'</b>이 완성된 상태입니다.<br/>
            추후 아래와 같은 기능들이 좌측 메뉴를 통해 순차적으로 개발되어 연동될 예정입니다:
          </p>
          <ul className="list-disc list-inside bg-gray-900/50 p-4 rounded border border-gray-800 text-gray-300">
            <li><span className="text-white">유저 및 정지 관리:</span> 악성 유저의 접속을 원천 차단하는 영구 정지 기능</li>
            <li><span className="text-white">신고 접수 내역:</span> 유저들이 신고한 채팅이나 게시글을 확인하고 처리하는 기능</li>
            <li><span className="text-white">뉴스/가이드 작성:</span> 개발자(코드) 도움 없이 여기서 바로 공지사항이나 꿀팁을 발행하는 기능</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
