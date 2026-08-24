export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-300">
      <h1 className="text-3xl font-bold text-white mb-8">이용약관 (Terms of Service)</h1>
      
      <div className="space-y-6 bg-[#1a232c] p-8 rounded-lg border border-gray-800">
        <section>
          <h2 className="text-xl font-bold text-white mb-2">제1조 (목적)</h2>
          <p>본 약관은 "발로란트 듀오 파인더"(이하 "서비스")가 제공하는 서비스의 이용과 관련하여 회사와 사용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">제2조 (서비스의 제공)</h2>
          <p>본 서비스는 사용자 간의 게임(발로란트) 파티 구인을 돕기 위한 게시판 및 1:1 채팅 기능을 제공합니다. 서비스는 일시적인 서버 점검이나 기술적 문제로 중단될 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">제3조 (사용자의 의무)</h2>
          <p>사용자는 서비스 이용 시 다음 행위를 해서는 안 됩니다:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>타인의 계정(라이엇 ID, 디스코드)을 무단으로 도용하는 행위</li>
            <li>욕설, 비방, 음란물 등 타인에게 불쾌감을 주는 게시물 및 채팅 작성</li>
            <li>상업적인 광고나 스팸(도배) 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">제4조 (책임의 한계)</h2>
          <p>본 서비스는 사용자 간의 매칭을 돕는 플랫폼일 뿐이며, 유저 간 발생한 분쟁이나 게임 내 제재에 대해 어떠한 법적 책임도 지지 않습니다.</p>
        </section>
      </div>
    </div>
  );
}
