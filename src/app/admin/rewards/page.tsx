"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Reward = {
  id: number;
  from_wallet: string;
  to_wallet: string;
  amount: number;
  type: string;
  created_at: string;
};

export default function RewardsPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin_logged_in") === "true";
    if (!isAdmin) {
      alert("🔒 관리자 로그인 후 이용해주세요.");
      router.push("/admin/login");
      return;
    }

    const fetchRewards = async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ 리워드 내역 조회 오류:", error);
      } else {
        setRewards(data || []);
      }

      setLoading(false);
    };

    fetchRewards();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">💰 추천 리워드 내역</h1>
      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <table className="w-full bg-white shadow rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">보낸사람</th>
              <th className="p-2 text-left">받은사람</th>
              <th className="p-2 text-left">금액(USDT)</th>
              <th className="p-2 text-left">유형</th>
              <th className="p-2 text-left">지급일시</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((reward) => (
              <tr key={reward.id} className="border-t">
                <td className="p-2">{reward.from_wallet}</td>
                <td className="p-2">{reward.to_wallet}</td>
                <td className="p-2">{reward.amount}</td>
                <td className="p-2">{reward.type}</td>
                <td className="p-2">
                  {new Date(reward.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
