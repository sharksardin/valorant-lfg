"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Ban, Trash2, CheckCircle } from "lucide-react";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    // 1. 신고 내역 가져오기
    const { data: reportsData } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (reportsData && reportsData.length > 0) {
      // 2. 관련된 모든 유저(신고자, 피신고자)의 프로필 정보 가져오기 (외래키 충돌 방지용 수동 Join)
      const userIds = [...new Set(reportsData.flatMap(r => [r.reporter_id, r.reported_id]))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, riot_id, discord_name, is_banned")
        .in("id", userIds);

      // 3. 데이터 병합
      const merged = reportsData.map(r => ({
        ...r,
        reporter: profilesData?.find(p => p.id === r.reporter_id) || null,
        reported: profilesData?.find(p => p.id === r.reported_id) || null
      }));
      setReports(merged);
    } else {
      setReports([]);
    }
    setLoading(false);
  };

  const toggleBanStatus = async (userId: string, currentStatus: boolean, riotId: string) => {
    const action = currentStatus ? "정지 해제" : "영구 정지";
    if (!confirm(`정말 '${riotId}' 유저를 ${action} 하시겠습니까?`)) return;

    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: !currentStatus })
      .eq("id", userId);

    if (error) {
      alert(`${action} 처리에 실패했습니다: ${error.message}`);
    } else {
      alert(`${action} 처리되었습니다.`);
      fetchReports(); // 목록 새로고침
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm("이 신고 내역을 삭제(처리 완료)하시겠습니까?")) return;
    
    const { error } = await supabase.from("reports").delete().eq("id", reportId);
    if (error) {
      alert("삭제 실패: " + error.message);
    } else {
      setReports(reports.filter(r => r.id !== reportId));
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-white mb-8">신고 접수 내역</h1>

      <div className="bg-[#1a232c] rounded-xl border border-gray-800 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">신고 내역을 불러오는 중입니다...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#151b22] text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="p-4 font-bold">신고 일시</th>
                  <th className="p-4 font-bold text-[var(--valo-red)]">피신고자 (가해자)</th>
                  <th className="p-4 font-bold">신고자 (피해자)</th>
                  <th className="p-4 font-bold">신고 사유</th>
                  <th className="p-4 font-bold text-right">빠른 조치</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 text-xs text-gray-500">{new Date(report.created_at).toLocaleString()}</td>
                    <td className="p-4">
                      <div className="font-bold text-white">{report.reported?.riot_id || "알수없음"}</div>
                      <div className="text-xs text-gray-500">{report.reported?.discord_name}</div>
                      {report.reported?.is_banned && (
                        <span className="inline-block mt-1 bg-red-900/50 text-red-400 border border-red-800/50 px-1.5 py-0.5 rounded text-[10px] font-bold">정지된 유저</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-300">{report.reporter?.riot_id || "알수없음"}</div>
                      <div className="text-xs text-gray-500">{report.reporter?.discord_name}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-gray-300 text-xs bg-gray-900 p-3 rounded border border-gray-800 max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {report.reason}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {report.reported && (
                          <button 
                            onClick={() => toggleBanStatus(report.reported.id, report.reported.is_banned, report.reported.riot_id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                              report.reported.is_banned 
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                                : 'bg-red-950/50 text-red-400 border border-red-900 hover:bg-red-900 hover:text-white'
                            }`}
                          >
                            {report.reported.is_banned ? <><CheckCircle size={14}/> 해제</> : <><Ban size={14}/> 밴</>}
                          </button>
                        )}
                        <button 
                          onClick={() => deleteReport(report.id)}
                          className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded text-xs transition-colors"
                          title="신고 내역 삭제 (처리 완료)"
                        >
                          <Trash2 size={14} /> 무시/삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-500">접수된 신고 내역이 없습니다. 평화롭네요!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
