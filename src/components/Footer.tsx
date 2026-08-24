import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-[#111] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <div>© 2024 VALODUO. All rights reserved.</div>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-gray-300 transition-colors">이용약관</Link>
          <Link href="/privacy" className="hover:text-gray-300 transition-colors">개인정보처리방침</Link>
        </div>
      </div>
    </footer>
  );
}
