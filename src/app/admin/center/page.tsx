"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  wallet_address: string;
  nickname: string;
  is_center: boolean;
};

export default function CenterPage() {
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
        .select("id, wallet_address, nickname, is_center")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ 유저 조회 오류:", error);
      } else {
        setUsers(data || []);
      }

      setLoading(false);
    };

    fetchUsers();
  }, [router]);

  const toggleCenter = async (user: User) => {
    const { error } = await supabase
      .from("users")
      .update({ is_center: !user.is_center })
      .eq("id", user.id);

    if (error) {
      alert("❌ 업데이트 실패");
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_center: !u.is_center } : u
        )
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">🏢 센터장 설정</h1>
      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <table className="w-full bg-white shadow rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">지갑 주소</th>
              <th className="p-2 text-left">닉네임</th>
              <th className="p-2 text-left">센터 여부</th>
              <th className="p-2 text-left">관리</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.wallet_address}</td>
                <td className="p-2">{user.nickname}</td>
                <td className="p-2">
                  {user.is_center ? "✅ 센터장" : "❌ 일반회원"}
                </td>
                <td className="p-2">
                  <button
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                    onClick={() => toggleCenter(user)}
                  >
                    {user.is_center ? "해제" : "지정"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
