export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-300">
      <h1 className="text-3xl font-bold text-white mb-8">개인정보처리방침 (Privacy Policy)</h1>
      
      <div className="space-y-6 bg-[#1a232c] p-8 rounded-lg border border-gray-800">
        <section>
          <h2 className="text-xl font-bold text-white mb-2">1. 수집하는 개인정보 항목</h2>
          <p>본 서비스는 OAuth(Discord) 및 라이엇 게임즈 API를 통해 다음과 같은 최소한의 정보를 수집합니다:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>디스코드 고유 ID, 닉네임, 프로필 사진</li>
            <li>발로란트 닉네임, 태그, 티어 정보 (사용자가 직접 입력 시)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">2. 개인정보의 수집 및 이용 목적</h2>
          <p>수집된 정보는 다음의 목적으로만 이용됩니다:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>서비스 이용자 식별 및 본인 확인</li>
            <li>원활한 파티 매칭을 위한 프로필 표시</li>
            <li>불량 이용자 제재 및 부정 이용 방지</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">3. 개인정보의 보유 및 이용 기간</h2>
          <p>사용자의 개인정보는 원칙적으로 회원 탈퇴 시 즉시 파기됩니다. 단, 부정 이용 기록은 악용 방지를 위해 6개월간 보관될 수 있습니다.</p>
        </section>
      </div>
    </div>
  );
}
