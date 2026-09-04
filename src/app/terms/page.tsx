export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 text-gray-300">
      <h1 className="text-3xl font-bold text-white mb-6">이용약관 (Terms of Service)</h1>
      <div className="space-y-6 text-sm leading-relaxed bg-[#1a232c] p-8 rounded-xl border border-gray-800">
        <section>
          <h2 className="text-xl font-bold text-white mb-2">제 1 조 (목적)</h2>
          <p>본 약관은 VALODUO (이하 "서비스")가 제공하는 인터넷 관련 서비스의 이용과 관련하여 서비스와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-2">제 2 조 (회원의 의무)</h2>
          <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>타인의 정보(디스코드, 라이엇 계정 등)를 도용하는 행위</li>
            <li>서비스에서 얻은 정보를 회사의 사전 승낙 없이 복제 또는 유통하는 행위</li>
            <li>공공질서 및 미풍양속에 위반되는 내용(욕설, 비방, 음란물 등)을 등록하는 행위</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-2">제 3 조 (서비스의 제공 및 변경)</h2>
          <p>서비스는 무료로 제공되며, 운영상의 필요에 따라 서비스의 전부 또는 일부를 변경하거나 종료할 수 있습니다. 본 서비스는 라이엇 게임즈(Riot Games)와 공식적인 관련이 없는 팬 커뮤니티 사이트입니다.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-2">제 4 조 (면책조항)</h2>
          <p>서비스는 이용자가 게재한 정보, 자료, 사실의 신뢰도 및 정확성에 대해 책임을 지지 않으며, 이용자 간에 발생한 분쟁에 대해 개입할 의무가 없습니다.</p>
        </section>
      </div>
    </div>
  );
}
