"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  wallet_address: string;
  nickname: string;
  referral_code: string;
  inviter_code: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin_logged_in") === "true";
    if (!isAdmin) {
      alert("🔒 관리자 로그인 후 이용해주세요.");
      router.push("/admin/login");
      return;
    }

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ 유저 목록 조회 오류:", error);
      } else {
        setUsers(data || []);
      }

      setLoading(false);
    };

    fetchUsers();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">👥 회원 목록</h1>
      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <table className="w-full bg-white shadow rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">지갑 주소</th>
              <th className="p-2 text-left">닉네임</th>
              <th className="p-2 text-left">추천코드</th>
              <th className="p-2 text-left">초대받음</th>
              <th className="p-2 text-left">가입일시</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.wallet_address}</td>
                <td className="p-2">{user.nickname}</td>
                <td className="p-2">{user.referral_code}</td>
                <td className="p-2">{user.inviter_code}</td>
                <td className="p-2">{new Date(user.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
