export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 text-gray-300">
      <h1 className="text-3xl font-bold text-white mb-6">개인정보처리방침 (Privacy Policy)</h1>
      <div className="space-y-6 text-sm leading-relaxed bg-[#1a232c] p-8 rounded-xl border border-gray-800">
        <section>
          <h2 className="text-xl font-bold text-white mb-2">1. 수집하는 개인정보의 항목</h2>
          <p>본 서비스(VALODUO)는 원활한 듀오 매칭 서비스를 제공하기 위해 아래의 정보를 수집하고 있습니다.</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>필수 항목: 디스코드 고유 ID, 디스코드 닉네임, 아바타 이미지 주소, 라이엇 게임즈 닉네임(#태그 포함)</li>
            <li>자동 수집 항목: 서비스 이용 기록, 쿠키(Cookie), 접속 IP 정보</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-2">2. 개인정보의 수집 및 이용 목적</h2>
          <p>수집된 개인정보는 다음의 목적을 위해 활용됩니다:</p>
          <ul className="list-disc list-inside mt-2 지space-y-1">
            <li>회원 가입 의사 확인 및 이용자 식별</li>
            <li>사용자 간 1:1 채팅 서비스 제공</li>
            <li>구인 게시글 작성 및 서비스 부정 이용 방지</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-2">3. 개인정보의 보유 및 이용 기간</h2>
          <p>원칙적으로, 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 일정 기간 보관할 수 있습니다.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-2">4. 구글 애드센스(Google AdSense) 및 쿠키 사용</h2>
          <p>본 웹사이트는 Google AdSense 광고를 게재할 수 있습니다. 구글을 포함한 타사 공급업체는 쿠키를 사용하여 사용자가 이 웹사이트나 다른 웹사이트에 이전에 방문한 내역을 기반으로 광고를 게재합니다. 사용자는 구글 광고 설정 페이지에서 맞춤 광고를 해제할 수 있습니다.</p>
        </section>
      </div>
    </div>
  );
}
