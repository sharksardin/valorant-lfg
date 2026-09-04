"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, Ban, CheckCircle } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch users:", error);
    } else {
      setUsers(data || []);
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
      fetchUsers(); // 목록 새로고침
    }
  };

  const filteredUsers = users.filter(u => 
    (u.riot_id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.discord_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">유저 및 정지 관리</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="라이엇ID 또는 디스코드 닉네임 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-[#1a232c] border border-gray-800 rounded-lg text-white text-sm outline-none focus:border-[var(--valo-red)] w-72 transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#1a232c] rounded-xl border border-gray-800 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">유저 목록을 불러오는 중입니다...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#151b22] text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="p-4 font-bold">프로필</th>
                  <th className="p-4 font-bold">라이엇 ID (티어)</th>
                  <th className="p-4 font-bold">디스코드 닉네임</th>
                  <th className="p-4 font-bold">가입일</th>
                  <th className="p-4 font-bold text-center">상태</th>
                  <th className="p-4 font-bold text-right">관리 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="avatar" className="w-10 h-10 rounded-full border border-gray-700" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-500 border border-gray-700">?</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{user.riot_id || "미연동"}</div>
                      <div className="text-xs text-gray-500">{user.valorant_tier || "Unranked"}</div>
                    </td>
                    <td className="p-4 text-gray-400">{user.discord_name}</td>
                    <td className="p-4 text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      {user.is_admin ? (
                        <span className="bg-purple-900/50 text-purple-400 border border-purple-800/50 px-2 py-1 rounded text-xs font-bold">관리자</span>
                      ) : user.is_banned ? (
                        <span className="bg-red-900/50 text-red-400 border border-red-800/50 px-2 py-1 rounded text-xs font-bold">영구 정지</span>
                      ) : (
                        <span className="bg-green-900/50 text-green-400 border border-green-800/50 px-2 py-1 rounded text-xs font-bold">정상</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {!user.is_admin && (
                        <button 
                          onClick={() => toggleBanStatus(user.id, user.is_banned, user.riot_id || user.discord_name)}
                          className={`flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                            user.is_banned 
                              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                              : 'bg-red-950/50 text-red-400 border border-red-900 hover:bg-red-900 hover:text-white'
                          }`}
                        >
                          {user.is_banned ? (
                            <><CheckCircle size={14} /> 정지 해제</>
                          ) : (
                            <><Ban size={14} /> 영구 정지</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-500">검색된 유저가 없습니다.</td>
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
